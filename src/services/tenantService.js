const prisma = require('../config/prisma');

class TenantService {
  async getSubAccounts(tenantId) {
    return await prisma.tenant.findMany({
      where: { parentId: tenantId },
      include: {
        _count: { select: { users: true, leads: true, contacts: true, deals: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createSubAccount(parentTenantId, data) {
    if (!data.name) {
      const err = new Error('Sub-account organization name is required.');
      err.statusCode = 400;
      throw err;
    }

    return await prisma.tenant.create({
      data: {
        name: data.name.trim(),
        domain: data.domain ? data.domain.trim() : null,
        parentId: parentTenantId,
        subscription: data.subscription || 'ACTIVE_PRO',
        status: data.status || 'ACTIVE',
        settings: data.settings || { theme: 'dark', territory: 'Default Region' },
      },
    });
  }

  async getSettings(tenantId) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, name: true, domain: true, subscription: true, status: true, settings: true },
    });

    if (!tenant) {
      const err = new Error('Tenant organization not found.');
      err.statusCode = 404;
      throw err;
    }

    return tenant;
  }

  async updateSettings(tenantId, data) {
    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.domain !== undefined) updateData.domain = data.domain.trim();
    if (data.settings !== undefined) updateData.settings = data.settings;

    return await prisma.tenant.update({
      where: { id: tenantId },
      data: updateData,
    });
  }
}

module.exports = new TenantService();
