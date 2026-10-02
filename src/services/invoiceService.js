const prisma = require('../config/prisma');

class InvoiceService {
  async getAll(tenantId, query = {}) {
    const { search, status, customerId } = query;
    const where = { tenantId };

    if (status && status !== 'all') {
      where.status = status;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search } },
        { customerName: { contains: search } },
        { customerEmail: { contains: search } },
      ];
    }

    return await prisma.invoice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true, company: true, email: true } },
        deal: { select: { id: true, title: true, value: true } },
        project: { select: { id: true, name: true } },
      },
    });
  }

  async getById(tenantId, id) {
    const invoice = await prisma.invoice.findFirst({
      where: { id, tenantId },
      include: {
        customer: true,
        deal: true,
        project: true,
      },
    });

    if (!invoice) {
      const err = new Error('Invoice not found or access denied.');
      err.statusCode = 404;
      throw err;
    }

    return invoice;
  }

  async create(tenantId, data) {
    if (!data.customerName) {
      const err = new Error('Customer name is required.');
      err.statusCode = 400;
      throw err;
    }

    let amount = parseFloat(data.amount) || 0;
    let subtotal = parseFloat(data.subtotal) || amount;
    let tax = parseFloat(data.tax) || 0;
    let discount = parseFloat(data.discount) || 0;

    const invoiceCount = await prisma.invoice.count({ where: { tenantId } });
    const invoiceNumber = data.invoiceNumber || `INV-${new Date().getFullYear()}-${String(invoiceCount + 101).padStart(3, '0')}`;

    return await prisma.invoice.create({
      data: {
        tenantId,
        invoiceNumber,
        customerId: data.customerId || null,
        customerName: data.customerName.trim(),
        customerEmail: data.customerEmail ? data.customerEmail.trim() : null,
        dealId: data.dealId || null,
        projectId: data.projectId || null,
        amount,
        subtotal,
        tax,
        discount,
        status: data.status || 'Sent',
        dueDate: data.dueDate ? new Date(data.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        issueDate: data.issueDate ? new Date(data.issueDate) : new Date(),
        items: data.items || null,
        notes: data.notes || null,
      },
      include: {
        customer: { select: { id: true, name: true, company: true } },
      },
    });
  }

  async update(tenantId, id, data) {
    await this.getById(tenantId, id);

    const updateData = {};
    if (data.customerName !== undefined) updateData.customerName = data.customerName.trim();
    if (data.customerEmail !== undefined) updateData.customerEmail = data.customerEmail;
    if (data.amount !== undefined) updateData.amount = parseFloat(data.amount) || 0;
    if (data.subtotal !== undefined) updateData.subtotal = parseFloat(data.subtotal) || 0;
    if (data.tax !== undefined) updateData.tax = parseFloat(data.tax) || 0;
    if (data.discount !== undefined) updateData.discount = parseFloat(data.discount) || 0;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.items !== undefined) updateData.items = data.items;

    return await prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        customer: { select: { id: true, name: true, company: true } },
      },
    });
  }

  async delete(tenantId, id) {
    await this.getById(tenantId, id);
    return await prisma.invoice.delete({
      where: { id },
    });
  }
}

module.exports = new InvoiceService();
