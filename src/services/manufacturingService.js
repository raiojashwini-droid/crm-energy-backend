const prisma = require('../config/prisma');

class ManufacturingService {
  async getOrders(tenantId, query = {}) {
    const { status, search } = query;
    const where = { tenantId };

    if (status && status !== 'all') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { productName: { contains: search } },
        { bomCode: { contains: search } },
      ];
    }

    return await prisma.productionOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async createOrder(tenantId, data) {
    if (!data.productName) {
      const err = new Error('Product name is required.');
      err.statusCode = 400;
      throw err;
    }

    const count = await prisma.productionOrder.count({ where: { tenantId } });
    const orderNumber = data.orderNumber || `MFG-${new Date().getFullYear()}-${String(count + 201).padStart(3, '0')}`;

    return await prisma.productionOrder.create({
      data: {
        tenantId,
        orderNumber,
        productName: data.productName.trim(),
        quantity: parseInt(data.quantity, 10) || 1,
        bomCode: data.bomCode || `BOM-${(data.productName || 'STD').slice(0, 3).toUpperCase()}-01`,
        status: data.status || 'Scheduled',
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        completionDate: data.completionDate ? new Date(data.completionDate) : null,
      },
    });
  }

  async updateOrder(tenantId, id, data) {
    const order = await prisma.productionOrder.findFirst({ where: { id, tenantId } });
    if (!order) {
      const err = new Error('Production order not found.');
      err.statusCode = 404;
      throw err;
    }

    const updateData = {};
    if (data.productName !== undefined) updateData.productName = data.productName.trim();
    if (data.quantity !== undefined) updateData.quantity = parseInt(data.quantity, 10) || 1;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.completionDate !== undefined) updateData.completionDate = data.completionDate ? new Date(data.completionDate) : null;

    return await prisma.productionOrder.update({
      where: { id },
      data: updateData,
    });
  }
}

module.exports = new ManufacturingService();
