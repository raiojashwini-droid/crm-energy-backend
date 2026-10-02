const territoryService = require('../services/territoryService');

class TerritoryController {
  async getAll(req, res, next) {
    try {
      const territories = await territoryService.getAll(req.user.tenantId, req.query);
      return res.status(200).json({
        success: true,
        count: territories.length,
        data: territories,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const territory = await territoryService.getById(req.user.tenantId, req.params.id);
      return res.status(200).json({
        success: true,
        data: territory,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const territory = await territoryService.create(req.user.tenantId, req.body);
      return res.status(201).json({
        success: true,
        message: 'Territory defined successfully.',
        data: territory,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const territory = await territoryService.update(req.user.tenantId, req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Territory updated successfully.',
        data: territory,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await territoryService.delete(req.user.tenantId, req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Territory deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TerritoryController();
