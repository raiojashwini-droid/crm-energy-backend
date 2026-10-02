const tenantService = require('../services/tenantService');

class TenantController {
  async getSubAccounts(req, res, next) {
    try {
      const subAccounts = await tenantService.getSubAccounts(req.user.tenantId);
      return res.status(200).json({
        success: true,
        count: subAccounts.length,
        data: subAccounts,
      });
    } catch (error) {
      next(error);
    }
  }

  async createSubAccount(req, res, next) {
    try {
      const subAccount = await tenantService.createSubAccount(req.user.tenantId, req.body);
      return res.status(201).json({
        success: true,
        message: 'Sub-account provisioned successfully.',
        data: subAccount,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSettings(req, res, next) {
    try {
      const settings = await tenantService.getSettings(req.user.tenantId);
      return res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSettings(req, res, next) {
    try {
      const updated = await tenantService.updateSettings(req.user.tenantId, req.body);
      return res.status(200).json({
        success: true,
        message: 'Company settings saved to database.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TenantController();
