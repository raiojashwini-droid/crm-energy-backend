const crypto = require('crypto');
const prisma = require('../config/prisma');
const eboxService = require('./eboxService');

class SwmtpService {
  constructor() {
    this.timeoutMs = 5000;
  }

  getConnectorKey() {
    return process.env.SWMTP_CONNECTOR_KEY || process.env.CRM_NERGY_CONNECTOR_KEY || 'crm_nergy_live_secret_key_v2_2026';
  }

  getSwmtpBaseUrl() {
    return process.env.SWMTP_BASE_URL || 'http://127.0.0.1:5000/api/v1';
  }

  /**
   * Validates HMAC-SHA256 signature over raw request body
   */
  verifySignature(rawBody, signature) {
    if (!signature) return false;
    const key = this.getConnectorKey();
    const content = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody));
    const hmac = crypto.createHmac('sha256', key);
    hmac.update(content);
    const expected = hmac.digest('hex');

    try {
      const sigBuf = Buffer.from(signature, 'hex');
      const expBuf = Buffer.from(expected, 'hex');
      if (sigBuf.length !== expBuf.length) return false;
      return crypto.timingSafeEqual(sigBuf, expBuf);
    } catch {
      return false;
    }
  }

  /**
   * Enforces timestamp freshness (5 min window) to prevent replay attacks
   */
  isTimestampFresh(timestamp) {
    if (!timestamp) return true; // Optional if not provided
    const time = new Date(timestamp).getTime();
    if (isNaN(time)) return false;
    const maxDrift = 5 * 60 * 1000;
    return Math.abs(Date.now() - time) <= maxDrift;
  }

  /**
   * Process inbound staff message from SWMTP
   */
  async handleInboundMessage({ body, rawBody, headers }) {
    const apiKey = headers['x-platform-api-key'] || headers['x-api-key'];
    const signature = headers['x-swmtp-signature'] || headers['x-signature'];

    // 1. Authenticate SWMTP Platform Connector
    const expectedKey = this.getConnectorKey();
    if (!apiKey || apiKey !== expectedKey) {
      const err = new Error('UNAUTHORIZED_CONNECTOR: Invalid or missing API key for CRM nErgy platform.');
      err.statusCode = 401;
      throw err;
    }

    // 2. Validate HMAC Signature if provided
    if (signature) {
      const isValidSig = this.verifySignature(rawBody || body, signature);
      if (!isValidSig) {
        const err = new Error('INVALID_SIGNATURE: HMAC-SHA256 signature validation failed.');
        err.statusCode = 401;
        throw err;
      }
    }

    // 3. Strict Customer Chat Isolation (Zero Leakage Enforcement)
    const {
      messageId,
      conversationId,
      sender,
      recipient,
      textContent,
      messageType = 'text',
      isCustomer = false,
      channelType,
      eventType,
      timestamp
    } = body;

    if (
      isCustomer === true ||
      channelType === 'customer_support' ||
      messageType === 'customer_chat' ||
      eventType === 'customer_chat' ||
      eventType === 'customer_support_message'
    ) {
      const err = new Error('CUSTOMER_MESSAGE_REJECTED: CRM nErgy internal staff gateway strictly rejects customer support messaging.');
      err.statusCode = 422;
      throw err;
    }

    // 4. Validate Freshness & Replay
    if (timestamp && !this.isTimestampFresh(timestamp)) {
      const err = new Error('TIMESTAMP_STALE: Webhook timestamp outside allowed freshness window.');
      err.statusCode = 400;
      throw err;
    }

    // 5. Validate Required Fields
    if (!messageId || !conversationId) {
      const err = new Error('Missing required messageId or conversationId.');
      err.statusCode = 400;
      throw err;
    }

    const recipientStaffId = recipient?.externalStaffId;
    if (!recipientStaffId) {
      const err = new Error('Recipient externalStaffId is required');
      err.statusCode = 400;
      throw err;
    }

    if ((!textContent || typeof textContent !== 'string') && !body.fileMetadata && !body.fileData) {
      const err = new Error('Message textContent or fileMetadata is required.');
      err.statusCode = 400;
      throw err;
    }

    // 6. Resolve & Authorize Staff Member
    const staff = await prisma.user.findFirst({
      where: {
        OR: [
          { id: recipientStaffId },
          { email: recipientStaffId }
        ]
      }
    });

    if (!staff) {
      const err = new Error(`Staff member '${recipientStaffId}' not found in CRM nErgy directory.`);
      err.statusCode = 404;
      throw err;
    }

    // Customer accounts can NEVER receive SWMTP messages
    if (staff.role === 'CUSTOMER') {
      const err = new Error('CUSTOMER_MESSAGE_REJECTED: Customer accounts cannot receive internal staff messaging.');
      err.statusCode = 422;
      throw err;
    }

    // 7. Deduplication & Idempotency Enforcement
    const subjectToken = `[SWMTP:${conversationId}] ${messageId}`;
    const existing = await prisma.eboxMessage.findFirst({
      where: {
        tenantId: staff.tenantId,
        subject: subjectToken,
      }
    });

    if (existing) {
      return {
        success: true,
        delivered: true,
        messageId,
        receivedAt: existing.createdAt.toISOString(),
        deliveredTo: staff.name,
        isDuplicate: true,
        eboxId: existing.id
      };
    }

    // 8. Encrypt using AES-256-GCM Vault Standard
    const messageEnvelope = (body.fileMetadata || body.fileData)
      ? JSON.stringify({ textContent: textContent || '', fileMetadata: body.fileMetadata, fileData: body.fileData, messageType: messageType || 'file' })
      : (textContent || '').trim();
    const encryptedMessage = eboxService.encryptText(messageEnvelope);

    // 9. Persist into Verified EboxMessage Schema
    const senderName = sender?.senderName || 'SWMTP Master Admin';
    const senderId = sender?.senderExternalStaffId || sender?.platformId || 'swmtp-core-admin';

    const saved = await prisma.eboxMessage.create({
      data: {
        tenantId: staff.tenantId,
        senderId,
        senderName,
        recipient: staff.name,
        subject: subjectToken,
        message: encryptedMessage,
        priority: 'High',
        isEncrypted: true
      }
    });

    return {
      success: true,
      delivered: true,
      messageId,
      receivedAt: saved.createdAt.toISOString(),
      deliveredTo: staff.name,
      eboxId: saved.id
    };
  }

  /**
   * Retrieve staff inbox messages
   */
  async getStaffInbox(staffId) {
    const staff = await prisma.user.findFirst({
      where: {
        OR: [
          { id: staffId },
          { email: staffId }
        ]
      }
    });

    if (!staff) {
      const err = new Error(`Staff member '${staffId}' not found.`);
      err.statusCode = 404;
      throw err;
    }

    const messages = await prisma.eboxMessage.findMany({
      where: {
        tenantId: staff.tenantId,
        OR: [
          { recipient: staff.name },
          { recipient: 'Johnny (Super Executive Admin)' },
          { recipient: 'Kiaan Tech Team' },
          { subject: { contains: '[SWMTP:' } }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    const parsed = messages
      .filter((m) => m.subject.includes('[SWMTP:') || m.recipient === staff.name)
      .map((m) => {
        let text = m.message;
        if (m.isEncrypted) {
          try {
            text = eboxService.decryptText(m.message);
          } catch {
            text = '[Encrypted Payload]';
          }
        }

        // Extract conversationId from subject [SWMTP:convId] msgId
        const match = m.subject.match(/\[SWMTP:([^\]]+)\]\s*(.*)/);
        const conversationId = match ? match[1] : 'conv-swmtp-main';
        const rawMsgId = match && match[2] ? match[2] : m.id;

        return {
          id: rawMsgId,
          eboxId: m.id,
          conversationId,
          sender: { name: m.senderName, id: m.senderId },
          recipient: { id: staff.id, name: staff.name },
          textContent: text,
          receivedAt: m.createdAt.toISOString(),
          priority: m.priority
        };
      });

    return parsed;
  }

  /**
   * Dispatch outbound staff reply back to SWMTP Hub
   */
  async sendStaffReply({ tenantId, userId, conversationId, textContent, idempotencyKey, messageType = 'text', fileMetadata = null, fileData = null, fileName = null, skipLocalPersist = false }) {
    if ((!textContent && !fileMetadata && !fileData) || !conversationId) {
      const err = new Error('conversationId and message content or attachment are required.');
      err.statusCode = 400;
      throw err;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, role: true, tenantId: true }
    });

    if (!user) {
      const err = new Error(`User '${userId}' not found.`);
      err.statusCode = 404;
      throw err;
    }

    // 1. Persist locally first into MySQL ebox_messages (AES-256-GCM encrypted) unless caller already did
    let saved = null;
    if (!skipLocalPersist) {
      const rawContent = (fileData || fileMetadata)
        ? JSON.stringify({ textContent: textContent || '', fileMetadata, fileData, fileName, messageType })
        : (textContent || '').trim();
      const encryptedText = eboxService.encryptText(rawContent);
      const subject = `[SWMTP:${conversationId}] Reply by ${user.name}`;

      saved = await prisma.eboxMessage.create({
        data: {
          tenantId: user.tenantId || tenantId,
          senderId: user.id,
          senderName: user.name,
          recipient: 'SWMTP Master Admin',
          subject,
          message: encryptedText,
          priority: 'High',
          isEncrypted: true
        }
      });
    }

    // 2. Dispatch to SWMTP Hub Webhook
    const replyIdempotency = idempotencyKey || `crm-reply-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const swmtpUrl = `${this.getSwmtpBaseUrl().replace(/\/+$/, '')}/internal-chat/integrations/crm-nergy/events`;
    const connectorKey = this.getConnectorKey();

    const payload = {
      eventType: 'INTERNAL_STAFF_MESSAGE',
      isInternalStaff: true,
      conversationId,
      senderExternalStaffId: user.id,
      senderName: user.name,
      textContent: (textContent || (messageType === 'audio' ? '🎤 Voice note' : (fileName ? `📎 ${fileName}` : '📎 Attachment'))).trim(),
      messageType,
      fileMetadata,
      fileData,
      fileName,
      idempotencyKey: replyIdempotency,
      timestamp: new Date().toISOString()
    };

    let swmtpResponse = null;
    let dispatchStatus = 'sent';

    try {
      const res = await fetch(swmtpUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Platform-Api-Key': connectorKey
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(this.timeoutMs)
      });

      const data = await res.json().catch(() => null);

      if (res.ok) {
        swmtpResponse = data;
        dispatchStatus = 'delivered';
      } else {
        dispatchStatus = 'failed';
        console.warn(`[SWMTP Dispatch Warning]: Remote platform returned HTTP ${res.status}:`, data);
      }
    } catch (netErr) {
      dispatchStatus = 'offline_queued';
      console.warn(`[SWMTP Dispatch Network Warning]: Hub unreachable (${netErr.message}). Local eBox message safely persisted.`);
    }

    return {
      success: true,
      delivered: dispatchStatus === 'delivered',
      dispatchStatus,
      eboxMessage: saved ? {
        id: saved.id,
        subject: saved.subject,
        createdAt: saved.createdAt
      } : null,
      swmtpResponse
    };
  }
}

module.exports = new SwmtpService();
