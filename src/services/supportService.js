const prisma = require('../config/prisma');

class SupportService {
  // Tickets
  async getTickets(tenantId, query = {}) {
    const { status, priority, search } = query;
    const where = { tenantId };

    if (status && status !== 'all') {
      where.status = status;
    }

    if (priority && priority !== 'all') {
      where.priority = priority;
    }

    if (search) {
      where.OR = [
        { ticketNumber: { contains: search } },
        { title: { contains: search } },
        { description: { contains: search } },
        { category: { contains: search } },
      ];
    }

    return await prisma.supportTicket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        contact: { select: { id: true, name: true, email: true, company: true } },
        assignedUser: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async getTicketById(tenantId, id) {
    const ticket = await prisma.supportTicket.findFirst({
      where: { id, tenantId },
      include: {
        contact: true,
        assignedUser: true,
      },
    });

    if (!ticket) {
      const err = new Error('Support ticket not found.');
      err.statusCode = 404;
      throw err;
    }

    return ticket;
  }

  async createTicket(tenantId, data) {
    if (!data.title) {
      const err = new Error('Ticket title is required.');
      err.statusCode = 400;
      throw err;
    }

    const count = await prisma.supportTicket.count({ where: { tenantId } });
    const ticketNumber = data.ticketNumber || `TCK-${String(count + 501).padStart(4, '0')}`;

    return await prisma.supportTicket.create({
      data: {
        tenantId,
        ticketNumber,
        title: data.title.trim(),
        description: data.description ? data.description.trim() : 'Customer support inquiry',
        category: data.category || 'Technical',
        priority: data.priority || 'Medium',
        status: data.status || 'Open',
        contactId: data.contactId || null,
        assignedUserId: data.assignedUserId || null,
        slaHours: parseInt(data.slaHours, 10) || 24,
      },
      include: {
        contact: { select: { id: true, name: true, email: true } },
        assignedUser: { select: { id: true, name: true } },
      },
    });
  }

  async updateTicket(tenantId, id, data) {
    await this.getTicketById(tenantId, id);

    const updateData = {};
    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.assignedUserId !== undefined) updateData.assignedUserId = data.assignedUserId;
    if (data.contactId !== undefined) updateData.contactId = data.contactId;

    return await prisma.supportTicket.update({
      where: { id },
      data: updateData,
      include: {
        contact: { select: { id: true, name: true } },
        assignedUser: { select: { id: true, name: true } },
      },
    });
  }

  async deleteTicket(tenantId, id) {
    await this.getTicketById(tenantId, id);
    return await prisma.supportTicket.delete({ where: { id } });
  }

  // Knowledge Base Articles
  async getArticles(tenantId, query = {}) {
    const { category, search } = query;
    const where = { tenantId };

    if (category && category !== 'all') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { category: { contains: search } },
      ];
    }

    return await prisma.knowledgeArticle.findMany({
      where,
      orderBy: { views: 'desc' },
    });
  }

  async createArticle(tenantId, data) {
    if (!data.title || !data.content) {
      const err = new Error('Article title and content are required.');
      err.statusCode = 400;
      throw err;
    }

    return await prisma.knowledgeArticle.create({
      data: {
        tenantId,
        title: data.title.trim(),
        category: data.category || 'General',
        content: data.content,
        views: parseInt(data.views, 10) || 0,
        isPublished: data.isPublished !== undefined ? Boolean(data.isPublished) : true,
      },
    });
  }
}

module.exports = new SupportService();
