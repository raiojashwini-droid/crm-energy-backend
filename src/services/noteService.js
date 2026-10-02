const prisma = require('../config/prisma');

class NoteService {
  async getAll(tenantId, query = {}) {
    const { leadId, contactId, dealId } = query;
    const where = { tenantId };

    if (leadId) where.leadId = leadId;
    if (contactId) where.contactId = contactId;
    if (dealId) where.dealId = dealId;

    return await prisma.note.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });
  }

  async create(tenantId, data, authorId) {
    if (!data.content) {
      const err = new Error('Note content is required.');
      err.statusCode = 400;
      throw err;
    }

    const note = await prisma.note.create({
      data: {
        tenantId,
        authorId: authorId || null,
        leadId: data.leadId || null,
        contactId: data.contactId || null,
        dealId: data.dealId || null,
        content: data.content.trim(),
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });

    // Log Activity
    await prisma.activity.create({
      data: {
        tenantId,
        userId: authorId,
        leadId: data.leadId || null,
        contactId: data.contactId || null,
        dealId: data.dealId || null,
        type: 'NOTE_ADDED',
        title: 'Note attached',
        description: data.content.substring(0, 100),
      },
    }).catch(() => {});

    return note;
  }

  async update(tenantId, id, data) {
    const note = await prisma.note.findFirst({
      where: { id, tenantId },
    });

    if (!note) {
      const err = new Error('Note not found or access denied.');
      err.statusCode = 404;
      throw err;
    }

    return await prisma.note.update({
      where: { id },
      data: {
        content: data.content ? data.content.trim() : note.content,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async delete(tenantId, id) {
    const note = await prisma.note.findFirst({
      where: { id, tenantId },
    });

    if (!note) {
      const err = new Error('Note not found or access denied.');
      err.statusCode = 404;
      throw err;
    }

    return await prisma.note.delete({
      where: { id },
    });
  }
}

module.exports = new NoteService();
