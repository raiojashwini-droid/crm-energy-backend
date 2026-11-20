const prisma = require('../config/prisma');

// 12 Standard Roles verified from CRM Architecture & Login Gateway
const ALL_CRM_ROLES = [
  'business_owner',
  'content_creator',
  'influencer',
  'ai_marketing_pro',
  'admin_1',
  'crm_pro',
  'customer',
  'content_builder',
  'affiliate_partner',
  'hr',
  'admin_2',
  'super_admin'
];

// Baseline enterprise default nav permissions for all 12 roles
const DEFAULT_PERMISSIONS = {
  business_owner: [
    'dashboard', 'contacts', 'leads', 'pipeline', 'tasks', 'communication',
    'territory', 'erp', 'bestie', 'ai-voice', 'ai', 'ai-video', 'marketing',
    'hr', 'support', 'knowledge-base', 'my-apps', 'search', 'reports',
    'admin', 'roles-permissions', 'ebox', 'settings'
  ],
  customer: [
    'dashboard', 'contacts', 'support', 'knowledge-base', 'tasks', 'communication', 'settings'
  ],
  content_creator: [
    'dashboard', 'bestie', 'ai', 'ai-video', 'my-apps', 'tasks', 'communication', 'knowledge-base', 'settings'
  ],
  content_builder: [
    'dashboard', 'marketing', 'ai', 'bestie', 'my-apps', 'tasks', 'communication', 'knowledge-base', 'settings'
  ],
  influencer: [
    'dashboard', 'leads', 'tasks', 'communication', 'my-apps', 'reports', 'settings'
  ],
  affiliate_partner: [
    'dashboard', 'leads', 'territory', 'pipeline', 'tasks', 'communication', 'reports', 'settings'
  ],
  ai_marketing_pro: [
    'dashboard', 'marketing', 'leads', 'pipeline', 'tasks', 'communication', 'ai', 'ai-video', 'bestie', 'reports', 'settings'
  ],
  hr: [
    'dashboard', 'hr', 'tasks', 'communication', 'reports', 'settings'
  ],
  admin_1: [
    'dashboard', 'contacts', 'leads', 'pipeline', 'tasks', 'communication', 'territory', 'erp', 'reports', 'settings'
  ],
  admin_2: [
    'dashboard', 'contacts', 'pipeline', 'tasks', 'erp', 'search', 'reports', 'settings'
  ],
  crm_pro: [
    'dashboard', 'contacts', 'leads', 'pipeline', 'tasks', 'communication', 'support', 'knowledge-base', 'reports', 'settings'
  ],
  super_admin: [
    'dashboard', 'contacts', 'leads', 'pipeline', 'tasks', 'communication',
    'territory', 'erp', 'bestie', 'ai-voice', 'ai', 'ai-video', 'marketing',
    'hr', 'support', 'knowledge-base', 'my-apps', 'search', 'reports',
    'admin', 'roles-permissions', 'ebox', 'settings'
  ]
};

class RolePermissionController {
  /**
   * GET /api/roles-permissions
   * Retrieves role permissions for active tenant with fallback to enterprise defaults
   */
  async getAllPermissions(req, res, next) {
    try {
      const tenantId = req.user?.tenantId || 'TENANT-08492';

      // 1. Fetch customized permissions from database
      const dbRecords = await prisma.rolePermission.findMany({
        where: { tenantId }
      });

      // 2. Build complete matrix with defaults as baseline
      const mergedPermissions = { ...DEFAULT_PERMISSIONS };

      dbRecords.forEach((record) => {
        try {
          const parsed = typeof record.allowedNavIds === 'string'
            ? JSON.parse(record.allowedNavIds)
            : record.allowedNavIds;

          if (Array.isArray(parsed)) {
            mergedPermissions[record.roleId] = parsed;
          }
        } catch (e) {
          console.warn(`[RolePermission] Error parsing record for ${record.roleId}:`, e.message);
        }
      });

      return res.status(200).json({
        success: true,
        tenantId,
        data: mergedPermissions,
        roles: ALL_CRM_ROLES
      });
    } catch (error) {
      console.error('[RolePermission getAll error]:', error);
      // Return defaults so UI never breaks
      return res.status(200).json({
        success: true,
        data: DEFAULT_PERMISSIONS,
        roles: ALL_CRM_ROLES,
        warning: 'Serving secure enterprise default permissions.'
      });
    }
  }

  /**
   * PUT /api/roles-permissions/:roleId
   * Updates allowed navigation IDs for a specific role
   */
  async updateRolePermission(req, res, next) {
    try {
      const { roleId } = req.params;
      const { allowedNavIds } = req.body;
      const tenantId = req.user?.tenantId || 'TENANT-08492';

      if (!roleId || !Array.isArray(allowedNavIds)) {
        return res.status(400).json({
          success: false,
          error: 'roleId and allowedNavIds (array of string IDs) are required.'
        });
      }

      // Safety: Business Owner and Super Admin must retain basic administrative access
      let sanitizedNavIds = [...allowedNavIds];
      if (roleId === 'business_owner' || roleId === 'super_admin') {
        const mustHave = ['dashboard', 'admin', 'roles-permissions', 'settings'];
        mustHave.forEach((m) => {
          if (!sanitizedNavIds.includes(m)) sanitizedNavIds.push(m);
        });
      }

      const jsonStr = JSON.stringify(sanitizedNavIds);

      // Upsert in database
      const updated = await prisma.rolePermission.upsert({
        where: {
          tenantId_roleId: {
            tenantId,
            roleId
          }
        },
        update: {
          allowedNavIds: jsonStr
        },
        create: {
          tenantId,
          roleId,
          allowedNavIds: jsonStr
        }
      });

      // Resilient mirror into Tenant.settings as secondary backup
      try {
        const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
        let currentSettings = {};
        if (tenant?.settings) {
          try { currentSettings = JSON.parse(tenant.settings); } catch (e) {}
        }
        currentSettings.rolePermissions = currentSettings.rolePermissions || {};
        currentSettings.rolePermissions[roleId] = sanitizedNavIds;

        await prisma.tenant.update({
          where: { id: tenantId },
          data: { settings: JSON.stringify(currentSettings) }
        });
      } catch (mirrorErr) {
        console.warn('[RolePermission mirror warning]:', mirrorErr.message);
      }

      return res.status(200).json({
        success: true,
        message: `Permissions updated successfully for role: ${roleId}`,
        data: {
          roleId,
          allowedNavIds: sanitizedNavIds,
          updatedAt: updated.updatedAt
        }
      });
    } catch (error) {
      console.error('[RolePermission update error]:', error);
      next(error);
    }
  }

  /**
   * POST /api/roles-permissions/bulk
   * Saves permissions for multiple roles in one operation
   */
  async bulkUpdatePermissions(req, res, next) {
    try {
      const { permissions } = req.body;
      const tenantId = req.user?.tenantId || 'TENANT-08492';

      if (!permissions || typeof permissions !== 'object') {
        return res.status(400).json({
          success: false,
          error: 'permissions object is required { [roleId]: string[] }'
        });
      }

      const results = {};

      for (const [roleId, navIds] of Object.entries(permissions)) {
        if (!Array.isArray(navIds)) continue;

        let sanitizedNavIds = [...navIds];
        if (roleId === 'business_owner' || roleId === 'super_admin') {
          const mustHave = ['dashboard', 'admin', 'roles-permissions', 'settings'];
          mustHave.forEach((m) => {
            if (!sanitizedNavIds.includes(m)) sanitizedNavIds.push(m);
          });
        }

        const jsonStr = JSON.stringify(sanitizedNavIds);

        await prisma.rolePermission.upsert({
          where: {
            tenantId_roleId: {
              tenantId,
              roleId
            }
          },
          update: { allowedNavIds: jsonStr },
          create: { tenantId, roleId, allowedNavIds: jsonStr }
        });

        results[roleId] = sanitizedNavIds;
      }

      return res.status(200).json({
        success: true,
        message: 'All role permissions updated successfully in MySQL vault.',
        data: results
      });
    } catch (error) {
      console.error('[RolePermission bulkUpdate error]:', error);
      next(error);
    }
  }

  /**
   * POST /api/roles-permissions/reset
   * Resets permissions for the tenant back to default values
   */
  async resetToDefaults(req, res, next) {
    try {
      const tenantId = req.user?.tenantId || 'TENANT-08492';

      await prisma.rolePermission.deleteMany({
        where: { tenantId }
      });

      return res.status(200).json({
        success: true,
        message: 'Restored enterprise security defaults for all 12 roles.',
        data: DEFAULT_PERMISSIONS
      });
    } catch (error) {
      console.error('[RolePermission reset error]:', error);
      next(error);
    }
  }
}

module.exports = new RolePermissionController();
