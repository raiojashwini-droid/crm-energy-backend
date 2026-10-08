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
  async getAll(tenantId, query = {}, user = null) {
    const { status, priority, assignedUserId, leadId, contactId, dealId } = query;
    const where = { tenantId };

    // Scope for CUSTOMER role: only tasks linked to customer account or assigned to them
    if (user && user.role === 'CUSTOMER') {
      where.OR = [
        { assignedUserId: user.userId },
        { contact: { email: user.email || '__no_email__' } },
      ];
    } else {
      if (assignedUserId) where.assignedUserId = assignedUserId;
      if (leadId) where.leadId = leadId;
      if (contactId) where.contactId = contactId;
      if (dealId) where.dealId = dealId;
    }

    if (status && status !== 'all') {
      where.status = normalizeTaskStatus(status);
    }

    if (priority && priority !== 'all') {
      where.priority = normalizePriority(priority);
    }

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

  async getById(tenantId, id, user = null) {
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

    // Customer scoping check
    if (user && user.role === 'CUSTOMER') {
      const isOwner = task.assignedUserId === user.userId || (task.contact && task.contact.email === user.email);
      if (!isOwner) {
        const err = new Error('Task not found or access denied.');
        err.statusCode = 404;
        throw err;
      }
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

  async update(tenantId, id, data, user = null) {
    const existing = await this.getById(tenantId, id, user);

    const isAdmin = user && ['SUPER_ADMIN', 'BUSINESS_OWNER', 'OPERATIONS_SALES_ADMIN'].includes(user.role);
    if (user && !isAdmin) {
      if (!existing.assignedUserId || existing.assignedUserId !== user.userId) {
        const err = new Error('Forbidden. You may only modify tasks assigned to you. Unassigned tasks require administrative authorization.');
        err.statusCode = 403;
        throw err;
      }
    }

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

  async toggleComplete(tenantId, id, user = null) {
    const task = await this.getById(tenantId, id, user);

    const isAdmin = user && ['SUPER_ADMIN', 'BUSINESS_OWNER', 'OPERATIONS_SALES_ADMIN'].includes(user.role);
    if (user && !isAdmin) {
      if (!task.assignedUserId || task.assignedUserId !== user.userId) {
        const err = new Error('Forbidden. You may only toggle tasks assigned to you. Unassigned tasks require administrative authorization.');
        err.statusCode = 403;
        throw err;
      }
    }

    const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';

    return await prisma.task.update({
      where: { id },
      data: { status: newStatus },
      include: {
        assignedUser: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async delete(tenantId, id, user = null) {
    const task = await this.getById(tenantId, id, user);

    const isAdmin = user && ['SUPER_ADMIN', 'BUSINESS_OWNER', 'OPERATIONS_SALES_ADMIN'].includes(user.role);
    if (user && !isAdmin) {
      if (!task.assignedUserId || task.assignedUserId !== user.userId) {
        const err = new Error('Forbidden. You may only delete tasks assigned to you. Unassigned tasks require administrative authorization.');
        err.statusCode = 403;
        throw err;
      }
    }

    return await prisma.task.delete({
      where: { id },
    });
  }
}

module.exports = new TaskService();
