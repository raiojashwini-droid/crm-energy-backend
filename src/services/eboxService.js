const prisma = require('../config/prisma');

class EboxService {
  async getMessages(tenantId) {
    return await prisma.eboxMessage.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
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

    return await prisma.eboxMessage.create({
      data: {
        tenantId,
        senderId: userId,
        senderName: user?.name || 'Super Executive Admin',
        recipient: data.recipient || 'Kiaan Tech Team',
        subject: data.subject.trim(),
        message: data.message.trim(),
        priority: data.priority || 'Normal',
        isEncrypted: true,
      },
    });
  }
}

module.exports = new EboxService();
