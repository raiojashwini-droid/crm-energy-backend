const prisma = require('../config/prisma');

class ContactService {
  async getAll(tenantId, query = {}) {
    const { search, status, type, assignedUserId } = query;
    const where = { tenantId };

    if (status && status !== 'all') {
      where.status = status;
    }

    if (type && type !== 'all') {
      where.type = type;
    }

    if (assignedUserId) {
      where.assignedUserId = assignedUserId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { company: { contains: search } },
        { email: { contains: search } },
      ];
    }

    return await prisma.contact.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        assignedUser: { select: { id: true, name: true, email: true, avatar: true, role: true } },
        _count: { select: { deals: true, tasks: true, notes: true, activities: true } },
      },
    });
  }

  async getById(tenantId, id) {
    const contact = await prisma.contact.findFirst({
      where: { id, tenantId },
      include: {
        assignedUser: { select: { id: true, name: true, email: true, avatar: true, role: true } },
        deals: true,
        tasks: true,
        notes: { include: { author: { select: { id: true, name: true } } } },
        activities: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!contact) {
      const err = new Error('Contact not found or access denied.');
      err.statusCode = 404;
      throw err;
    }

    return contact;
  }

  async create(tenantId, data, userId) {
    if (!data.name) {
      const err = new Error('Contact name is required.');
      err.statusCode = 400;
      throw err;
    }

    let totalValue = data.totalValue || 0;
    if (typeof totalValue === 'string') {
      totalValue = parseFloat(totalValue.replace(/[^0-9.-]+/g, '')) || 0;
    }

    const contact = await prisma.contact.create({
      data: {
        tenantId,
        assignedUserId: data.assignedUserId || userId || null,
        name: data.name.trim(),
        company: data.company ? data.company.trim() : null,
        email: data.email ? data.email.trim() : null,
        phone: data.phone ? data.phone.trim() : null,
        type: data.type || 'Enterprise Client',
        title: data.title || null,
        status: data.status || 'Active',
        totalValue,
        lastActivity: new Date(),
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
        contactId: contact.id,
        type: 'NOTE_ADDED',
        title: `Contact '${contact.name}' was created`,
        description: `Company: ${contact.company || 'N/A'}, Type: ${contact.type}`,
      },
    }).catch(() => {});

    return contact;
  }

  async update(tenantId, id, data) {
    await this.getById(tenantId, id);

    let totalValue = data.totalValue;
    if (typeof totalValue === 'string') {
      totalValue = parseFloat(totalValue.replace(/[^0-9.-]+/g, '')) || 0;
    }

    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.company !== undefined) updateData.company = data.company ? data.company.trim() : null;
    if (data.email !== undefined) updateData.email = data.email ? data.email.trim() : null;
    if (data.phone !== undefined) updateData.phone = data.phone ? data.phone.trim() : null;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.status !== undefined) updateData.status = data.status;
    if (totalValue !== undefined) updateData.totalValue = totalValue;
    if (data.assignedUserId !== undefined) updateData.assignedUserId = data.assignedUserId;
    updateData.lastActivity = new Date();

    return await prisma.contact.update({
      where: { id },
      data: updateData,
      include: {
        assignedUser: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async delete(tenantId, id) {
    await this.getById(tenantId, id);
    return await prisma.contact.delete({
      where: { id },
    });
  }

  async bulkDelete(tenantId, ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      return { count: 0 };
    }
    return await prisma.contact.deleteMany({
      where: {
        id: { in: ids },
        tenantId,
      },
    });
  }
}

module.exports = new ContactService();
