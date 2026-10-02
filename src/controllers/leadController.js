const leadService = require('../services/leadService');

class LeadController {
  async getAll(req, res, next) {
    try {
      const leads = await leadService.getAll(req.user.tenantId, req.query);
      return res.status(200).json({
        success: true,
        count: leads.length,
        data: leads,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const lead = await leadService.getById(req.user.tenantId, req.params.id);
      return res.status(200).json({
        success: true,
        data: lead,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const lead = await leadService.create(req.user.tenantId, req.body, req.user.userId);
      return res.status(201).json({
        success: true,
        message: 'Lead created successfully.',
        data: lead,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const lead = await leadService.update(req.user.tenantId, req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Lead updated successfully.',
        data: lead,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await leadService.delete(req.user.tenantId, req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Lead deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  async convert(req, res, next) {
    try {
      const result = await leadService.convertToContact(req.user.tenantId, req.params.id, req.user.userId);
      return res.status(200).json({
        success: true,
        message: 'Lead converted to Contact successfully.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LeadController();
