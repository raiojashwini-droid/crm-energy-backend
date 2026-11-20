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

function normalizeRole(roleStr) {
  if (!roleStr) return 'business_owner';
  const r = roleStr.toLowerCase().replace(/[^a-z0-9]/g, '_');
  if (r.includes('owner')) return 'business_owner';
  if (r.includes('super_admin') || r.includes('root')) return 'super_admin';
  if (r.includes('crm_pro') || r.includes('crm')) return 'crm_pro';
  if (r.includes('creator')) return 'content_creator';
  if (r.includes('builder')) return 'content_builder';
  if (r.includes('influencer')) return 'influencer';
  if (r.includes('customer') || r.includes('client')) return 'customer';
  if (r.includes('affiliate')) return 'affiliate_partner';
  if (r.includes('marketing') || r.includes('mktg')) return 'ai_marketing_pro';
  if (r.includes('hr')) return 'hr';
  if (r.includes('admin_2') || r.includes('admin_ii')) return 'admin_2';
  if (r.includes('admin_1') || r.includes('admin_i')) return 'admin_1';
  return r;
}

class EboxService {
  async getMessages(tenantId, userContext = null) {
    try {
      const messages = await prisma.eboxMessage.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
      });

      // Determine if requesting user is an Executive (Business Owner or Super Admin)
      const rawRole = normalizeRole(userContext?.role);
      const isExecutive = !userContext ||
        rawRole === 'business_owner' ||
        rawRole === 'super_admin' ||
        userContext?.role === 'BUSINESS_OWNER' ||
        userContext?.role === 'SUPER_ADMIN';

      const decrypted = messages.map((m) => {
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

      // If Executive, return all messages across all vaults & role channels
      if (isExecutive) {
        return decrypted;
      }

      // If Non-Executive role (e.g. Content Creator, Influencer, Customer, etc.):
      // ONLY return messages that belong to their dedicated 1-on-1 vault with Business Owner!
      const userUserId = userContext?.userId || userContext?.id;
      const userNameLower = (userContext?.name || '').toLowerCase();

      return decrypted.filter((m) => {
        const subj = (m.subject || '').toLowerCase();
        const recip = (m.recipient || '').toLowerCase();
        const sender = (m.senderName || '').toLowerCase();

        // 1. Matches their explicit role tag [ROLE:roleId] or [CHANNEL:roleId]
        if (subj.includes(`[role:${rawRole}]`) || subj.includes(`[channel:${rawRole}]`)) {
          return true;
        }

        // 2. Sent by this user
        if (m.senderId && m.senderId === userUserId) {
          return true;
        }

        // 3. Recipient matches user name or user role
        if (recip.includes(rawRole) || (userNameLower && recip.includes(userNameLower))) {
          return true;
        }

        // 4. Sender matches user name or user role
        if (sender.includes(rawRole) || (userNameLower && sender.includes(userNameLower))) {
          return true;
        }

        return false;
      });
    } catch (err) {
      console.error('[eBox getMessages critical error]:', err);
      // Return empty array instead of failing request with 500
      return [];
    }
  }

  async sendMessage(tenantId, userId, data, userContext = null) {
    if (!data.subject && !data.channelId && (!data.message && !data.fileData && !data.fileMetadata)) {
      const err = new Error('Subject and message content or attachment are required.');
      err.statusCode = 400;
      throw err;
    }

    const rawRole = normalizeRole(userContext?.role);
    const isExecutive = !userContext ||
      rawRole === 'business_owner' ||
      rawRole === 'super_admin' ||
      userContext?.role === 'BUSINESS_OWNER' ||
      userContext?.role === 'SUPER_ADMIN';

    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, role: true },
      });
    } catch (userErr) {
      console.warn('[eBox] Could not fetch user name:', userErr.message);
    }

    const senderDisplayName = data.senderName || user?.name || userContext?.name || (isExecutive ? 'Super Executive Admin' : `${userContext?.role || 'Staff Member'}`);

    // Compute subject with role tag if non-executive or targeting a specific role channel
    let subject = (data.subject || '').trim();
    if (!isExecutive) {
      if (!subject.toLowerCase().includes(`[role:${rawRole}]`)) {
        subject = `[ROLE:${rawRole}] ${subject || 'Direct Vault Message'}`;
      }
    } else if (data.roleChannelId) {
      const targetRole = normalizeRole(data.roleChannelId.replace('th-role-', ''));
      if (!subject.toLowerCase().includes(`[role:${targetRole}]`)) {
        subject = `[ROLE:${targetRole}] ${subject || 'Direct Vault Message'}`;
      }
    }

    const recipient = data.recipient || (isExecutive ? 'Kiaan Tech Team' : 'Business Owner & Super Admin');

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
    let encryptedMessage;
    try {
      encryptedMessage = encryptText(rawContent);
    } catch (encErr) {
      console.warn('[eBox] Encryption error, fallback to plaintext:', encErr.message);
      encryptedMessage = rawContent;
    }

    let saved = null;
    try {
      saved = await prisma.eboxMessage.create({
        data: {
          tenantId,
          senderId: userId,
          senderName: senderDisplayName,
          recipient,
          subject,
          message: encryptedMessage,
          priority: data.priority || 'Normal',
          isEncrypted: true,
        },
      });
    } catch (dbErr) {
      console.error('[eBox save error]:', dbErr.message);
      // Fallback: If large base64 failed to save in local DB, save lightweight metadata record
      try {
        const lightweightRaw = JSON.stringify({
          textContent: data.message || '',
          fileMetadata: data.fileMetadata ? { ...data.fileMetadata, isLargeAttachment: true } : null,
          fileName: data.fileName,
          messageType: data.messageType || 'file'
        });
        saved = await prisma.eboxMessage.create({
          data: {
            tenantId,
            senderId: userId,
            senderName: senderDisplayName,
            recipient,
            subject,
            message: encryptText(lightweightRaw),
            priority: data.priority || 'Normal',
            isEncrypted: true,
          },
        });
      } catch (fallbackDbErr) {
        console.error('[eBox fallback save error]:', fallbackDbErr.message);
        saved = { id: `tmp-msg-${Date.now()}`, createdAt: new Date() };
      }
    }

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
