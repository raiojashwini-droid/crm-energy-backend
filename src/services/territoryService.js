const prisma = require('../config/prisma');

class TerritoryService {
  async getAll(tenantId, query = {}) {
    const { region, search } = query;
    const where = { tenantId };

    if (region && region !== 'all' && region !== 'All Regions') {
      where.region = region;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
        { region: { contains: search } },
        { states: { contains: search } },
      ];
    }

    return await prisma.territory.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      include: {
        manager: { select: { id: true, name: true, email: true, role: true } },
      },
    });
  }

  async getById(tenantId, id) {
    const territory = await prisma.territory.findFirst({
      where: { id, tenantId },
      include: {
        manager: true,
      },
    });

    if (!territory) {
      const err = new Error('Territory not found.');
      err.statusCode = 404;
      throw err;
    }

    return territory;
  }

  async create(tenantId, data) {
    if (!data.name || !data.region) {
      const err = new Error('Territory name and region are required.');
      err.statusCode = 400;
      throw err;
    }

    const count = await prisma.territory.count({ where: { tenantId } });
    const code = data.code || `TERR-${(data.region || 'ZONE').slice(0, 4).toUpperCase()}-${count + 1}`;

    return await prisma.territory.create({
      data: {
        tenantId,
        code,
        name: data.name.trim(),
        region: data.region.trim(),
        states: data.states || null,
        managerId: data.managerId || null,
        targetQuota: parseFloat(data.targetQuota) || 0,
        status: data.status || 'Active',
      },
      include: {
        manager: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async update(tenantId, id, data) {
    await this.getById(tenantId, id);

    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.region !== undefined) updateData.region = data.region.trim();
    if (data.states !== undefined) updateData.states = data.states;
    if (data.managerId !== undefined) updateData.managerId = data.managerId || null;
    if (data.targetQuota !== undefined) updateData.targetQuota = parseFloat(data.targetQuota) || 0;
    if (data.status !== undefined) updateData.status = data.status;

    return await prisma.territory.update({
      where: { id },
      data: updateData,
      include: {
        manager: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async delete(tenantId, id) {
    await this.getById(tenantId, id);
    return await prisma.territory.delete({
      where: { id },
    });
  }
}

module.exports = new TerritoryService();
