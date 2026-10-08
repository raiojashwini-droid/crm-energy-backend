const crypto = require('crypto');
const prisma = require('../config/prisma');

const ENCRYPTION_KEY = process.env.EBOX_MASTER_KEY;
if (!ENCRYPTION_KEY) {
  throw new Error('EBOX_MASTER_KEY environment variable is not set');
}
const ALGORITHM = 'aes-256-gcm';
const LEGACY_ALGORITHM = 'aes-256-cbc';
const KEY = Buffer.from(ENCRYPTION_KEY, 'base64');
if (KEY.length !== 32) {
  throw new Error('EBOX_MASTER_KEY must be a Base64‑encoded 32‑byte key');
}
const LEGACY_SECRET = process.env.JWT_SECRET;
const LEGACY_KEY = LEGACY_SECRET ? crypto.createHash('sha256').update(LEGACY_SECRET).digest() : null;

const encryptText = (text) => {
  // Use AES-256-GCM with a 12‑byte IV as recommended for GCM
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // Store as iv:encrypted:authTag (all hex encoded)
  return `${iv.toString('hex')}:${encrypted.toString('hex')}:${authTag.toString('hex')}`;
};

const decryptText = (cipherText) => {
  if (!cipherText) return '';
  const parts = cipherText.split(':');

  // 1. New GCM format – iv:encrypted:authTag (3 parts)
  if (parts.length === 3) {
    const [ivHex, encryptedHex, authTagHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  }

  // 2. Legacy CBC format – iv:encrypted (2 parts)
  if (parts.length === 2 && LEGACY_KEY) {
    const [ivHex, encrypted] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(LEGACY_ALGORITHM, LEGACY_KEY, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  // 3. No known format – reject safely
  throw new Error('Unable to decrypt eBox message: unrecognized format or missing legacy key');
};

class EboxService {
  async getMessages(tenantId) {
    const messages = await prisma.eboxMessage.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    return messages.map((m) => ({
      ...m,
      message: m.isEncrypted ? decryptText(m.message) : m.message,
    }));
  }

  async sendMessage(tenantId, userId, data) {
    if (!data.subject || !data.message) {
      const err = new Error('Subject and message content are required.');
      err.statusCode = 400;
      throw err;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    const encryptedMessage = encryptText(data.message.trim());

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

    return {
      ...saved,
      message: data.message.trim(),
    };
  }
}

module.exports = new EboxService();
