const prisma = require('../config/prisma');

const TASK_STATUS_MAP = {
  pending: 'PENDING',
  'in progress': 'IN_PROGRESS',
  in_progress: 'IN_PROGRESS',
  completed: 'COMPLETED',
  done: 'COMPLETED',
  cancelled: 'CANCELLED',
};

const normalizeTaskStatus = (status) => {
  if (!status) return 'PENDING';
  const clean = String(status).trim().toLowerCase();
  return TASK_STATUS_MAP[clean] || 'PENDING';
};

const normalizePriority = (p) => {
  if (!p) return 'MEDIUM';
  const clean = String(p).trim().toUpperCase();
  if (['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(clean)) return clean;
  return 'MEDIUM';
};

class TaskService {
  async getAll(tenantId, query = {}) {
    const { status, priority, assignedUserId, leadId, contactId, dealId } = query;
    const where = { tenantId };

    if (status && status !== 'all') {
      where.status = normalizeTaskStatus(status);
    }

    if (priority && priority !== 'all') {
      where.priority = normalizePriority(priority);
    }

    if (assignedUserId) where.assignedUserId = assignedUserId;
    if (leadId) where.leadId = leadId;
    if (contactId) where.contactId = contactId;
    if (dealId) where.dealId = dealId;

    return await prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        assignedUser: { select: { id: true, name: true, email: true, avatar: true } },
        lead: { select: { id: true, name: true, company: true } },
        contact: { select: { id: true, name: true, company: true } },
        deal: { select: { id: true, title: true } },
      },
    });
  }

  async getById(tenantId, id) {
    const task = await prisma.task.findFirst({
      where: { id, tenantId },
      include: {
        assignedUser: { select: { id: true, name: true, email: true } },
        lead: true,
        contact: true,
        deal: true,
      },
    });

    if (!task) {
      const err = new Error('Task not found or access denied.');
      err.statusCode = 404;
      throw err;
    }

    return task;
  }

  async create(tenantId, data, userId) {
    if (!data.title) {
      const err = new Error('Task title is required.');
      err.statusCode = 400;
      throw err;
    }

    const task = await prisma.task.create({
      data: {
        tenantId,
        assignedUserId: data.assignedUserId || userId || null,
        leadId: data.leadId || null,
        contactId: data.contactId || null,
        dealId: data.dealId || null,
        title: data.title.trim(),
        description: data.description || null,
        priority: normalizePriority(data.priority),
        status: normalizeTaskStatus(data.status),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        reminder: data.reminder || null,
      },
      include: {
        assignedUser: { select: { id: true, name: true, email: true } },
      },
    });

    // Log Activity
    await prisma.activity.create({
      data: {
        tenantId,
        userId,
        leadId: data.leadId || null,
        contactId: data.contactId || null,
        dealId: data.dealId || null,
        type: 'TASK_CREATED',
        title: `Task created: '${task.title}'`,
        description: `Priority: ${task.priority}, Status: ${task.status}`,
      },
    }).catch(() => {});

    return task;
  }

  async update(tenantId, id, data) {
    await this.getById(tenantId, id);

    const updateData = {};
    if (data.title !== undefined) updateData.title = data.title.trim();
    if (data.description !== undefined) updateData.description = data.description;
    if (data.priority !== undefined) updateData.priority = normalizePriority(data.priority);
    if (data.status !== undefined) updateData.status = normalizeTaskStatus(data.status);
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (data.reminder !== undefined) updateData.reminder = data.reminder;
    if (data.assignedUserId !== undefined) updateData.assignedUserId = data.assignedUserId;

    return await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignedUser: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async toggleComplete(tenantId, id) {
    const task = await this.getById(tenantId, id);
    const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';

    return await prisma.task.update({
      where: { id },
      data: { status: newStatus },
      include: {
        assignedUser: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async delete(tenantId, id) {
    await this.getById(tenantId, id);
    return await prisma.task.delete({
      where: { id },
    });
  }
}

module.exports = new TaskService();
