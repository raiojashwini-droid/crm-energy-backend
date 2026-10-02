const prisma = require('../config/prisma');

const DEAL_STAGE_MAP = {
  'new lead': 'NEW_LEAD',
  'new_lead': 'NEW_LEAD',
  'new': 'NEW_LEAD',
  'contacted': 'CONTACTED',
  'qualified': 'QUALIFIED',
  'opportunity': 'OPPORTUNITY',
  'proposal': 'PROPOSAL',
  'negotiation': 'NEGOTIATION',
  'won': 'WON',
  'closed won': 'WON',
  'lost': 'LOST',
  'closed lost': 'LOST',
};

const normalizeDealStage = (stage) => {
  if (!stage) return 'NEW_LEAD';
  const clean = String(stage).trim().toLowerCase();
  return DEAL_STAGE_MAP[clean] || 'NEW_LEAD';
};

class DealService {
  async getAll(tenantId, query = {}) {
    const { stage, assignedUserId, search } = query;
    const where = { tenantId };

    if (stage && stage !== 'all') {
      where.stage = normalizeDealStage(stage);
    }

    if (assignedUserId) {
      where.assignedUserId = assignedUserId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { customer: { contains: search } },
      ];
    }

    return await prisma.deal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        assignedUser: { select: { id: true, name: true, email: true, avatar: true } },
        contact: { select: { id: true, name: true, company: true, email: true } },
        lead: { select: { id: true, name: true, company: true } },
        _count: { select: { tasks: true, notes: true, activities: true } },
      },
    });
  }

  async getById(tenantId, id) {
    const deal = await prisma.deal.findFirst({
      where: { id, tenantId },
      include: {
        assignedUser: { select: { id: true, name: true, email: true, avatar: true } },
        contact: true,
        lead: true,
        tasks: true,
        notes: { include: { author: { select: { id: true, name: true } } } },
        activities: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!deal) {
      const err = new Error('Deal not found or access denied.');
      err.statusCode = 404;
      throw err;
    }

    return deal;
  }

  async create(tenantId, data, userId) {
    if (!data.title) {
      const err = new Error('Deal title is required.');
      err.statusCode = 400;
      throw err;
    }

    let value = data.value || 0;
    if (typeof value === 'string') {
      value = parseFloat(value.replace(/[^0-9.-]+/g, '')) || 0;
    }

    let probability = parseInt(data.probability, 10);
    if (isNaN(probability)) probability = 50;

    const deal = await prisma.deal.create({
      data: {
        tenantId,
        assignedUserId: data.assignedUserId || userId || null,
        contactId: data.contactId || null,
        leadId: data.leadId || null,
        title: data.title.trim(),
        customer: data.customer ? data.customer.trim() : null,
        value,
        stage: normalizeDealStage(data.stage),
        probability,
        expectedClose: data.expectedClose ? new Date(data.expectedClose) : null,
        description: data.description || null,
      },
      include: {
        assignedUser: { select: { id: true, name: true, email: true } },
        contact: { select: { id: true, name: true } },
      },
    });

    // Log Activity
    await prisma.activity.create({
      data: {
        tenantId,
        userId,
        dealId: deal.id,
        type: 'STAGE_CHANGED',
        title: `Deal '${deal.title}' created in pipeline`,
        description: `Stage: ${deal.stage}, Value: $${deal.value}`,
      },
    }).catch(() => {});

    return deal;
  }

  async update(tenantId, id, data, userId) {
    const existing = await this.getById(tenantId, id);

    let value = data.value;
    if (typeof value === 'string') {
      value = parseFloat(value.replace(/[^0-9.-]+/g, '')) || 0;
    }

    const updateData = {};
    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.customer !== undefined) updateData.customer = data.customer ? data.customer.trim() : null;
    if (value !== undefined) updateData.value = value;
    if (data.stage !== undefined) updateData.stage = normalizeDealStage(data.stage);
    if (data.probability !== undefined) updateData.probability = parseInt(data.probability, 10) || 50;
    if (data.expectedClose !== undefined) updateData.expectedClose = data.expectedClose ? new Date(data.expectedClose) : null;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.assignedUserId !== undefined) updateData.assignedUserId = data.assignedUserId;
    if (data.contactId !== undefined) updateData.contactId = data.contactId;

    const updated = await prisma.deal.update({
      where: { id },
      data: updateData,
      include: {
        assignedUser: { select: { id: true, name: true, email: true } },
        contact: { select: { id: true, name: true } },
      },
    });

    // Log stage change activity if stage updated
    if (data.stage && normalizeDealStage(data.stage) !== existing.stage) {
      await prisma.activity.create({
        data: {
          tenantId,
          userId,
          dealId: id,
          type: 'STAGE_CHANGED',
          title: `Deal '${updated.title}' moved to ${updated.stage}`,
          description: `Stage updated from ${existing.stage} to ${updated.stage}`,
        },
      }).catch(() => {});
    }

    return updated;
  }

  async delete(tenantId, id) {
    await this.getById(tenantId, id);
    return await prisma.deal.delete({
      where: { id },
    });
  }
}

module.exports = new DealService();
