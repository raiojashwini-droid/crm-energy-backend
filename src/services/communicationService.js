const prisma = require('../config/prisma');

class CommunicationService {
  async getAll(tenantId, query = {}) {
    const { channel, contactId, leadId, search } = query;
    const where = { tenantId };

    if (channel && channel !== 'all') {
      where.channel = channel.toUpperCase();
    }

    if (contactId) {
      where.contactId = contactId;
    }

    if (leadId) {
      where.leadId = leadId;
    }

    if (search) {
      where.OR = [
        { recipient: { contains: search } },
        { sender: { contains: search } },
        { subject: { contains: search } },
        { body: { contains: search } },
      ];
    }

    return await prisma.communication.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        contact: { select: { id: true, name: true, email: true, phone: true } },
        lead: { select: { id: true, name: true, email: true, phone: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async send(tenantId, userId, data) {
    const channel = (data.channel || 'EMAIL').toUpperCase();
    const recipient = data.recipient ? data.recipient.trim() : '';
    const body = data.body ? data.body.trim() : '';
    const subject = data.subject ? data.subject.trim() : null;

    if (!recipient || !body) {
      const err = new Error('Recipient and message body are required.');
      err.statusCode = 400;
      throw err;
    }

    let status = 'SENT';
    let provider = 'INTERNAL';
    let errorDetails = null;

    // Check provider configuration
    if (channel === 'EMAIL') {
      const hasEmailProvider = Boolean(process.env.SENDGRID_API_KEY || process.env.SMTP_HOST);
      if (!hasEmailProvider) {
        status = 'NOT_CONFIGURED';
        errorDetails = 'Email provider (SendGrid / SMTP) is not configured in system settings.';
        provider = 'SENDGRID_RELAY';
      } else {
        provider = 'SENDGRID';
        status = 'SENT';
      }
    } else if (channel === 'SMS') {
      const hasSmsProvider = Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
      if (!hasSmsProvider) {
        status = 'NOT_CONFIGURED';
        errorDetails = 'SMS provider (Twilio API Gateway) is not configured in system settings.';
        provider = 'TWILIO_GATEWAY';
      } else {
        provider = 'TWILIO';
        status = 'SENT';
      }
    }

    const message = await prisma.communication.create({
      data: {
        tenantId,
        userId: userId || null,
        contactId: data.contactId || null,
        leadId: data.leadId || null,
        channel,
        direction: 'OUTBOUND',
        sender: data.sender || 'System Operator',
        recipient,
        subject,
        body,
        status,
        provider,
        errorDetails,
        attachments: data.attachments || null,
      },
      include: {
        contact: { select: { id: true, name: true, email: true } },
      },
    });

    return message;
  }

  async getById(tenantId, id) {
    const message = await prisma.communication.findFirst({
      where: { id, tenantId },
      include: {
        contact: true,
        lead: true,
        user: true,
      },
    });

    if (!message) {
      const err = new Error('Message record not found.');
      err.statusCode = 404;
      throw err;
    }

    return message;
  }
}

module.exports = new CommunicationService();
