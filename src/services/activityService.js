const prisma = require('../config/prisma');

const ACTIVITY_TYPE_MAP = {
  note_added: 'NOTE_ADDED',
  call_logged: 'CALL_LOGGED',
  email_sent: 'EMAIL_SENT',
  meeting_held: 'MEETING_HELD',
  stage_changed: 'STAGE_CHANGED',
  status_changed: 'STATUS_CHANGED',
  lead_converted: 'LEAD_CONVERTED',
  task_created: 'TASK_CREATED',
  task_completed: 'TASK_COMPLETED',
};

const normalizeActivityType = (t) => {
  if (!t) return 'NOTE_ADDED';
  const clean = String(t).trim().toLowerCase();
  return ACTIVITY_TYPE_MAP[clean] || 'NOTE_ADDED';
};

class ActivityService {
  async getAll(tenantId, query = {}) {
    const { leadId, contactId, dealId, limit } = query;
    const where = { tenantId };

    if (leadId) where.leadId = leadId;
    if (contactId) where.contactId = contactId;
    if (dealId) where.dealId = dealId;

    const take = parseInt(limit, 10) || 50;

    return await prisma.activity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        lead: { select: { id: true, name: true, company: true } },
        contact: { select: { id: true, name: true, company: true } },
        deal: { select: { id: true, title: true } },
      },
    });
  }

  async create(tenantId, data, userId) {
    if (!data.title) {
      const err = new Error('Activity title is required.');
      err.statusCode = 400;
      throw err;
    }

    return await prisma.activity.create({
      data: {
        tenantId,
        userId: userId || null,
        leadId: data.leadId || null,
        contactId: data.contactId || null,
        dealId: data.dealId || null,
        type: normalizeActivityType(data.type),
        title: data.title.trim(),
        description: data.description || null,
        metadata: data.metadata || null,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }
}

module.exports = new ActivityService();
