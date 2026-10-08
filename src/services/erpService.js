const prisma = require('../config/prisma');

class ErpService {
  // ============================================================================
  // CRM DEAL -> ERP HANDOFF (ATOMIC TRANSACTION)
  // ============================================================================
  async createFromDeal(tenantId, dealId, userId) {
    // 1. Fetch Deal and verify tenant isolation
    const deal = await prisma.deal.findFirst({
      where: { id: dealId, tenantId },
      include: {
        contact: { select: { id: true, name: true, company: true } },
        assignedUser: { select: { id: true, name: true, email: true } },
        erpProject: true,
      },
    });

    if (!deal) {
      const err = new Error('CRM Deal not found or access denied.');
      err.statusCode = 404;
      throw err;
    }

    // 2. Duplicate Prevention: Check if ERP Project already exists for this Deal
    if (deal.erpProject) {
      const existingOrder = await prisma.salesOrder.findFirst({
        where: { tenantId, dealId: deal.id },
      });
      return {
        project: deal.erpProject,
        salesOrder: existingOrder,
        alreadyCreated: true,
        message: 'ERP Project and Sales Order have already been created for this deal.',
      };
    }

    // 3. Atomic Prisma Transaction for Project + Sales Order + Activity Log
    return await prisma.$transaction(async (tx) => {
      const clientName = deal.customer || deal.contact?.company || deal.contact?.name || 'Enterprise Client';
      const projectName = deal.title.toLowerCase().includes('project')
        ? deal.title
        : `${deal.title} - Operational Deployment`;

      // 3a. Create ERP Project
      const project = await tx.erpProject.create({
        data: {
          tenantId,
          dealId: deal.id,
          contactId: deal.contactId || null,
          assignedUserId: deal.assignedUserId || userId || null,
          name: projectName,
          client: clientName,
          budget: deal.value || 0,
          spent: 0,
          progress: 10,
          status: 'In Progress',
          manager: deal.assignedUser?.name || 'Alexander Wright',
          deadline: deal.expectedClose || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        },
        include: {
          contact: { select: { id: true, name: true, company: true } },
          assignedUser: { select: { id: true, name: true } },
        },
      });

      // 3b. Create Sales Order
      const uniqueSuffix = `${Date.now().toString().slice(-4)}${Math.floor(100 + Math.random() * 900)}`;
      const salesOrder = await tx.salesOrder.create({
        data: {
          tenantId,
          dealId: deal.id,
          contactId: deal.contactId || null,
          projectId: project.id,
          orderNumber: `SO-${new Date().getFullYear()}-${uniqueSuffix}`,
          customer: clientName,
          items: `${deal.title} — Deliverables & Commercial Fulfillment Scope`,
          total: deal.value || 0,
          status: 'Processing',
          date: new Date(),
        },
      });

      // 3c. Log Activity in unified CRM audit trail
      await tx.activity.create({
        data: {
          tenantId,
          userId,
          dealId: deal.id,
          contactId: deal.contactId || null,
          type: 'STAGE_CHANGED',
          title: `ERP Handoff: Project '${project.name}' & Sales Order Created`,
          description: `Generated ERP Project #${project.id} with budget $${project.budget} and Sales Order #${salesOrder.orderNumber}.`,
        },
      });

      return {
        project,
        salesOrder,
        alreadyCreated: false,
        message: 'Successfully generated ERP Project and Sales Order from Won Deal.',
      };
    });
  }

  // ============================================================================
  // PROJECTS CRUD
  // ============================================================================
  async getProjects(tenantId, query = {}) {
    const { search, status, contactId, dealId } = query;
    const where = { tenantId };

    if (status && status !== 'all') {
      where.status = status;
    }
    if (contactId) where.contactId = contactId;
    if (dealId) where.dealId = dealId;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { client: { contains: search } },
      ];
    }

    return await prisma.erpProject.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        contact: { select: { id: true, name: true, company: true } },
        deal: { select: { id: true, title: true, value: true } },
        assignedUser: { select: { id: true, name: true, email: true } },
        salesOrders: true,
      },
    });
  }

  async getProjectById(tenantId, id) {
    const project = await prisma.erpProject.findFirst({
      where: { id, tenantId },
      include: {
        contact: true,
        deal: true,
        assignedUser: { select: { id: true, name: true, email: true } },
        salesOrders: true,
      },
    });

    if (!project) {
      const err = new Error('ERP Project not found or access denied.');
      err.statusCode = 404;
      throw err;
    }

    return project;
  }

  async createProject(tenantId, data, userId) {
    if (!data.name || !data.client) {
      const err = new Error('Project name and client account are required.');
      err.statusCode = 400;
      throw err;
    }

    let budget = data.budget || 0;
    if (typeof budget === 'string') {
      budget = parseFloat(budget.replace(/[^0-9.-]+/g, '')) || 0;
    }

    return await prisma.erpProject.create({
      data: {
        tenantId,
        assignedUserId: data.assignedUserId || userId || null,
        contactId: data.contactId || null,
        dealId: data.dealId || null,
        name: data.name.trim(),
        client: data.client.trim(),
        budget,
        spent: data.spent ? (typeof data.spent === 'string' ? parseFloat(data.spent.replace(/[^0-9.-]+/g, '')) : data.spent) : 0,
        progress: parseInt(data.progress, 10) || 0,
        status: data.status || 'In Progress',
        manager: data.manager || 'Alexander Wright',
        deadline: data.deadline ? new Date(data.deadline) : null,
      },
    });
  }

  async updateProject(tenantId, id, data) {
    await this.getProjectById(tenantId, id);

    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.client !== undefined) updateData.client = data.client.trim();
    if (data.status !== undefined) updateData.status = data.status;
    if (data.progress !== undefined) updateData.progress = parseInt(data.progress, 10);
    if (data.manager !== undefined) updateData.manager = data.manager;
    if (data.deadline !== undefined) updateData.deadline = data.deadline ? new Date(data.deadline) : null;
    if (data.budget !== undefined) {
      updateData.budget = typeof data.budget === 'string' ? parseFloat(data.budget.replace(/[^0-9.-]+/g, '')) || 0 : data.budget;
    }
    if (data.spent !== undefined) {
      updateData.spent = typeof data.spent === 'string' ? parseFloat(data.spent.replace(/[^0-9.-]+/g, '')) || 0 : data.spent;
    }

    return await prisma.erpProject.update({
      where: { id },
      data: updateData,
    });
  }

  // ============================================================================
  // SALES ORDERS
  // ============================================================================
  async getSalesOrders(tenantId, query = {}) {
    const { status, search, contactId, dealId, projectId } = query;
    const where = { tenantId };

    if (status && status !== 'all') where.status = status;
    if (contactId) where.contactId = contactId;
    if (dealId) where.dealId = dealId;
    if (projectId) where.projectId = projectId;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customer: { contains: search } },
        { items: { contains: search } },
      ];
    }

    return await prisma.salesOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        project: { select: { id: true, name: true } },
        deal: { select: { id: true, title: true } },
        contact: { select: { id: true, name: true, company: true } },
      },
    });
  }

  // ============================================================================
  // PURCHASE ORDERS (PROCUREMENT)
  // ============================================================================
  async getPurchaseOrders(tenantId, query = {}) {
    const { status, search } = query;
    const where = { tenantId };

    if (status && status !== 'all') where.status = status;
    if (search) {
      where.OR = [
        { poNumber: { contains: search } },
        { vendor: { contains: search } },
        { items: { contains: search } },
      ];
    }

    return await prisma.purchaseOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async createPurchaseOrder(tenantId, data) {
    if (!data.vendor || !data.items) {
      const err = new Error('Vendor name and item description are required.');
      err.statusCode = 400;
      throw err;
    }

    let amount = data.amount || 0;
    if (typeof amount === 'string') {
      amount = parseFloat(amount.replace(/[^0-9.-]+/g, '')) || 0;
    }

    return await prisma.purchaseOrder.create({
      data: {
        tenantId,
        poNumber: data.poNumber || `PO-2026-${Math.floor(400 + Math.random() * 500)}`,
        vendor: data.vendor.trim(),
        items: data.items.trim(),
        amount,
        status: data.status || 'Pending Approval',
        eta: data.eta || 'Within 10 Days',
        date: data.date ? new Date(data.date) : new Date(),
      },
    });
  }

  // ============================================================================
  // INVENTORY ITEMS
  // ============================================================================
  async getInventory(tenantId, query = {}) {
    const { warehouse, status, search } = query;
    const where = { tenantId };

    if (warehouse && warehouse !== 'all') {
      where.warehouse = { contains: warehouse };
    }
    if (status && status !== 'all') {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { sku: { contains: search } },
        { name: { contains: search } },
      ];
    }

    return await prisma.inventoryItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async createInventoryItem(tenantId, data) {
    if (!data.name || !data.sku) {
      const err = new Error('SKU and item name are required.');
      err.statusCode = 400;
      throw err;
    }

    let unitCost = data.unitCost || 0;
    if (typeof unitCost === 'string') {
      unitCost = parseFloat(unitCost.replace(/[^0-9.-]+/g, '')) || 0;
    }

    return await prisma.inventoryItem.create({
      data: {
        tenantId,
        sku: data.sku.trim(),
        name: data.name.trim(),
        category: data.category || 'Hardware',
        warehouse: data.warehouse || 'Austin Central',
        quantity: parseInt(data.quantity, 10) || 0,
        minThreshold: parseInt(data.minThreshold, 10) || 50,
        unitCost,
        status: data.status || 'Optimal',
      },
    });
  }
}

module.exports = new ErpService();
