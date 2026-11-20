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

    try {
      let tickets = await prisma.supportTicket.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          contact: { select: { id: true, name: true, email: true, company: true } },
          assignedUser: { select: { id: true, name: true, email: true } },
        },
      });

      // Auto-seed baseline enterprise support tickets if tenant has none
      if (!tickets || tickets.length === 0) {
        const totalCount = await prisma.supportTicket.count({ where: { tenantId } });
        if (totalCount === 0) {
          const seeds = [
            {
              tenantId,
              ticketNumber: 'TCK-9841',
              title: 'High-Priority SLA: Grid Power Telemetry Ingestion Latency',
              description: 'Inverters in Western Corridor reporting intermittent telemetry packet dropouts over MQTT broker.',
              category: 'Technical',
              priority: 'High',
              status: 'In Progress',
              slaHours: 12,
            },
            {
              tenantId,
              ticketNumber: 'TCK-9835',
              title: 'Billing & Commercial Tariff Reconciliation Discrepancy',
              description: 'Mismatch in utility peak rate consumption metrics for Q1 commercial audit review.',
              category: 'Billing',
              priority: 'Critical',
              status: 'Open',
              slaHours: 6,
            },
            {
              tenantId,
              ticketNumber: 'TCK-9820',
              title: 'ZBox SEA Cryptographic Multi-Signer Sync Issue',
              description: 'Hardware key exchange timed out during dual-authorization session for tenant admin vault.',
              category: 'Security',
              priority: 'Medium',
              status: 'In Progress',
              slaHours: 24,
            },
            {
              tenantId,
              ticketNumber: 'TCK-9812',
              title: 'Solar Field Inverter Telemetry Re-connection',
              description: 'Gateway unit rebooted successfully and telemetry feed restored with 100% data fidelity.',
              category: 'Field Ops',
              priority: 'Medium',
              status: 'Resolved',
              slaHours: 24,
            },
            {
              tenantId,
              ticketNumber: 'TCK-9798',
              title: 'API Webhook Callback Timeout on Commercial Metering',
              description: 'Configured retry backoff multiplier to prevent dropouts during high-frequency interval logging.',
              category: 'Integration',
              priority: 'Low',
              status: 'Resolved',
              slaHours: 48,
            },
          ];

          for (const s of seeds) {
            try {
              await prisma.supportTicket.create({ data: s });
            } catch (seedErr) {}
          }

          tickets = await prisma.supportTicket.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
              contact: { select: { id: true, name: true, email: true, company: true } },
              assignedUser: { select: { id: true, name: true, email: true } },
            },
          });
        }
      }

      return tickets;
    } catch (dbErr) {
      console.warn('[SupportService getTickets db error]:', dbErr.message);
      return [];
    }
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

    const ticketNumber = data.ticketNumber || `TCK-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`;

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
