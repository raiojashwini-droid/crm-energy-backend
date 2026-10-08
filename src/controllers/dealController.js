const dealService = require('../services/dealService');

class DealController {
  async getAll(req, res, next) {
    try {
      const deals = await dealService.getAll(req.user.tenantId, req.query, req.user);
      return res.status(200).json({
        success: true,
        count: deals.length,
        data: deals,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const deal = await dealService.getById(req.user.tenantId, req.params.id, req.user);
      return res.status(200).json({
        success: true,
        data: deal,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const deal = await dealService.create(req.user.tenantId, req.body, req.user.userId, req.user);
      return res.status(201).json({
        success: true,
        message: 'Deal created successfully.',
        data: deal,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const deal = await dealService.update(req.user.tenantId, req.params.id, req.body, req.user.userId, req.user);
      return res.status(200).json({
        success: true,
        message: 'Deal updated successfully.',
        data: deal,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await dealService.delete(req.user.tenantId, req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Deal deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DealController();
