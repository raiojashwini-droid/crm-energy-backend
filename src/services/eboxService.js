const crypto = require('crypto');
const prisma = require('../config/prisma');

// Primary Master Key
const ENCRYPTION_KEY = process.env.EBOX_MASTER_KEY || 'IZosytkK4NoUhOL4Hc3jHwqluRlsiy4iSSyEdJP3CnA=';
const ALGORITHM = 'aes-256-gcm';
const LEGACY_ALGORITHM = 'aes-256-cbc';

/**
 * Safely derives a 32-byte Buffer key from various secret representations
 */
function derive32ByteKey(secret) {
  if (!secret) return null;
  try {
    // 1. If base64 decoded is exactly 32 bytes
    const b64 = Buffer.from(secret, 'base64');
    if (b64.length === 32) return b64;
  } catch {}

  try {
    // 2. If hex decoded is exactly 32 bytes
    if (secret.length === 64) {
      const hex = Buffer.from(secret, 'hex');
      if (hex.length === 32) return hex;
    }
  } catch {}

  try {
    // 3. If raw string is exactly 32 bytes
    const raw = Buffer.from(secret, 'utf8');
    if (raw.length === 32) return raw;
  } catch {}

  try {
    // 4. SHA-256 hash always yields exactly 32 bytes
    return crypto.createHash('sha256').update(String(secret)).digest();
  } catch {}

  return null;
}

// Build list of candidate keys for resilient multi-version decryption
function getCandidateKeys() {
  const candidates = [];

  // Add primary derived key
  const primaryKey = derive32ByteKey(ENCRYPTION_KEY);
  if (primaryKey) candidates.push(primaryKey);

  // Add direct base64 decode if 32 bytes
  try {
    const rawB64 = Buffer.from(ENCRYPTION_KEY, 'base64');
    if (rawB64.length === 32) candidates.push(rawB64);
  } catch {}

  // Add SHA256 of master key
  if (ENCRYPTION_KEY) {
    candidates.push(crypto.createHash('sha256').update(ENCRYPTION_KEY).digest());
  }

  // Default hardcoded base64 key
  const defaultB64 = Buffer.from('IZosytkK4NoUhOL4Hc3jHwqluRlsiy4iSSyEdJP3CnA=', 'base64');
  candidates.push(defaultB64);

  // Add JWT_SECRET based candidates
  if (process.env.JWT_SECRET) {
    candidates.push(crypto.createHash('sha256').update(process.env.JWT_SECRET).digest());
    const derivedJwt = derive32ByteKey(process.env.JWT_SECRET);
    if (derivedJwt) candidates.push(derivedJwt);
  }

  // Known fallback secrets used in dev/prod
  const knownSecrets = [
    'crm-energy-secret-2026',
    'crm-energy-super-admin-secret-2026',
    'crm-energy-vault-2026',
    'crm-energy-secret',
    'super-executive-admin-secure-vault-token-2026'
  ];

  for (const s of knownSecrets) {
    candidates.push(crypto.createHash('sha256').update(s).digest());
  }

  // De-duplicate buffers by hex representation
  const seen = new Set();
  const uniqueCandidates = [];
  for (const k of candidates) {
    if (Buffer.isBuffer(k) && k.length === 32) {
      const hex = k.toString('hex');
      if (!seen.has(hex)) {
        seen.add(hex);
        uniqueCandidates.push(k);
      }
    }
  }

  return uniqueCandidates;
}

const CANDIDATE_KEYS = getCandidateKeys();
const PRIMARY_KEY = CANDIDATE_KEYS[0] || Buffer.from('IZosytkK4NoUhOL4Hc3jHwqluRlsiy4iSSyEdJP3CnA=', 'base64');

/**
 * Encrypts plaintext using AES-256-GCM
 */
const encryptText = (text) => {
  if (text === null || text === undefined) return '';
  const str = typeof text === 'string' ? text : JSON.stringify(text);

  // Use AES-256-GCM with a 12-byte IV
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, PRIMARY_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(str, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Store as iv:encrypted:authTag (all hex encoded)
  return `${iv.toString('hex')}:${encrypted.toString('hex')}:${authTag.toString('hex')}`;
};

/**
 * Resiliently decrypts cipherText across candidate keys and formats.
 * NEVER throws uncaught exception on authTag mismatch or legacy formats.
 */
const decryptText = (cipherText) => {
  if (!cipherText) return '';
  if (typeof cipherText !== 'string') return String(cipherText);

  // If text does not look encrypted (no colon separator), return as-is
  if (!cipherText.includes(':')) {
    return cipherText;
  }

  const parts = cipherText.split(':');

  // 1. AES-256-GCM format – iv:encrypted:authTag (3 hex parts)
  if (parts.length === 3) {
    const [ivHex, encryptedHex, authTagHex] = parts;
    try {
      const iv = Buffer.from(ivHex, 'hex');
      const encrypted = Buffer.from(encryptedHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');

      if (iv.length >= 12 && authTag.length === 16) {
        // Try candidate keys in order
        for (const candidateKey of CANDIDATE_KEYS) {
          try {
            const decipher = crypto.createDecipheriv(ALGORITHM, candidateKey, iv);
            decipher.setAuthTag(authTag);
            const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
            return decrypted.toString('utf8');
          } catch (e) {
            // Key mismatch or authTag verification failed; try next key
            continue;
          }
        }
      }
    } catch (parseErr) {
      console.warn('[eBox Decrypt Warning]: Invalid hex buffers in GCM cipherText');
    }

    // If none of the candidate keys worked, check if raw payload is readable or return safe notice
    console.warn('[eBox Decrypt Warning]: Unable to authenticate authTag across candidate keys for GCM message');
    return '[Encrypted Vault Message]';
  }

  // 2. Legacy CBC format – iv:encrypted (2 parts)
  if (parts.length === 2) {
    const [ivHex, encryptedHex] = parts;
    try {
      const iv = Buffer.from(ivHex, 'hex');
      if (iv.length === 16) {
        for (const candidateKey of CANDIDATE_KEYS) {
          try {
            const decipher = crypto.createDecipheriv(LEGACY_ALGORITHM, candidateKey, iv);
            let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
          } catch (e) {
            continue;
          }
        }
      }
    } catch (parseErr) {
      console.warn('[eBox Decrypt Warning]: Invalid hex buffers in CBC cipherText');
    }

    return '[Encrypted Legacy Vault Message]';
  }

  // 3. Fallback: Return raw string
  return cipherText;
};

class EboxService {
  async getMessages(tenantId) {
    try {
      const messages = await prisma.eboxMessage.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
      });

      return messages.map((m) => {
        let plainMessage = m.message;
        let decryptFailed = false;

        if (m.isEncrypted && m.message) {
          try {
            plainMessage = decryptText(m.message);
          } catch (decryptErr) {
            console.warn(`[eBox] Failed to decrypt message ${m.id}:`, decryptErr.message);
            plainMessage = '[Encrypted Message]';
            decryptFailed = true;
          }
        }

        return {
          ...m,
          message: plainMessage,
          isEncrypted: m.isEncrypted,
          isDecryptError: decryptFailed,
        };
      });
    } catch (err) {
      console.error('[eBox getMessages critical error]:', err);
      // Return empty array instead of failing request with 500
      return [];
    }
  }

  async sendMessage(tenantId, userId, data) {
    if (!data.subject || (!data.message && !data.fileData && !data.fileMetadata)) {
      const err = new Error('Subject and message content or attachment are required.');
      err.statusCode = 400;
      throw err;
    }

    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true },
      });
    } catch (userErr) {
      console.warn('[eBox] Could not fetch user name:', userErr.message);
    }

    const rawContent = (data.fileData || data.fileMetadata)
      ? JSON.stringify({
          textContent: data.message || '',
          fileMetadata: data.fileMetadata,
          fileData: data.fileData,
          fileName: data.fileName,
          messageType: data.messageType || 'file'
        })
      : (data.message || '').trim();

    // Encrypt content with primary GCM key
    const encryptedMessage = encryptText(rawContent);

    const saved = await prisma.eboxMessage.create({
      data: {
        tenantId,
        senderId: userId,
        senderName: user?.name || 'Super Executive Admin',
        recipient: data.recipient || 'Kiaan Tech Team',
        subject: data.subject.trim(),
        message: encryptedMessage,
        priority: data.priority || 'Normal',
        isEncrypted: true,
      },
    });

    let swmtpDelivery = null;
    if (data.isSwmtp || data.conversationId || (data.subject && data.subject.includes('[SWMTP:'))) {
      try {
        const swmtpService = require('./swmtpService');
        const match = data.subject.match(/\[SWMTP:([^\]]+)\]/);
        const conversationId = data.conversationId || (match ? match[1] : 'conv-swmtp-main');
        
        const swmtpResult = await swmtpService.sendStaffReply({
          tenantId,
          userId,
          conversationId,
          textContent: data.message || '',
          idempotencyKey: data.idempotencyKey,
          messageType: data.messageType || (data.fileData || data.fileMetadata ? 'file' : 'text'),
          fileMetadata: data.fileMetadata || null,
          fileData: data.fileData || null,
          fileName: data.fileName || null,
          skipLocalPersist: true
        });
        swmtpDelivery = swmtpResult;
      } catch (swmtpErr) {
        console.warn('[eBox SWMTP Outbound Warning]:', swmtpErr.message);
        swmtpDelivery = { delivered: false, error: swmtpErr.message };
      }
    }

    return {
      ...saved,
      message: (data.message || '').trim(),
      swmtpDelivery,
    };
  }
}

const serviceInstance = new EboxService();
serviceInstance.encryptText = encryptText;
serviceInstance.decryptText = decryptText;
serviceInstance.getCandidateKeys = getCandidateKeys;

module.exports = serviceInstance;
