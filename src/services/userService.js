const prisma = require('../config/prisma');
const { toFrontendRole } = require('../utils/roleMapper');

class UserService {
  async getAll(tenantId, query = {}) {
    const { role, isActive } = query;
    const where = { tenantId };

    if (role && role !== 'all') {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true' || isActive === true;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        avatar: true,
        tenantId: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });

    return users.map((u) => ({
      ...u,
      frontendRole: toFrontendRole(u.role),
    }));
  }

  async getById(tenantId, id) {
    const user = await prisma.user.findFirst({
      where: { id, tenantId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        avatar: true,
        tenantId: true,
        createdAt: true,
      },
    });

    if (!user) {
      const err = new Error('User not found or access denied.');
      err.statusCode = 404;
      throw err;
    }

    return {
      ...user,
      frontendRole: toFrontendRole(user.role),
    };
  }

  async updateProfile(userId, tenantId, data) {
    const { name, email, avatar } = data;
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.trim().toLowerCase();
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        avatar: true,
        tenantId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      ...user,
      frontendRole: toFrontendRole(user.role),
    };
  }

  async updateCompany(tenantId, data) {
    const { name, domain, subscription } = data;
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (domain) updateData.domain = domain.trim();
    if (subscription) updateData.subscription = subscription;

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: updateData,
    });

    return tenant;
  }
}

module.exports = new UserService();
