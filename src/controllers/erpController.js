const erpService = require('../services/erpService');

class ErpController {
  // Deal -> ERP Handoff
  async handoffFromDeal(req, res, next) {
    try {
      const result = await erpService.createFromDeal(req.user.tenantId, req.params.dealId, req.user.userId);
      return res.status(201).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Projects
  async getProjects(req, res, next) {
    try {
      const projects = await erpService.getProjects(req.user.tenantId, req.query);
      return res.status(200).json({
        success: true,
        count: projects.length,
        data: projects,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProjectById(req, res, next) {
    try {
      const project = await erpService.getProjectById(req.user.tenantId, req.params.id);
      return res.status(200).json({
        success: true,
        data: project,
      });
    } catch (error) {
      next(error);
    }
  }

  async createProject(req, res, next) {
    try {
      const project = await erpService.createProject(req.user.tenantId, req.body, req.user.userId);
      return res.status(201).json({
        success: true,
        message: 'ERP Project created successfully.',
        data: project,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProject(req, res, next) {
    try {
      const project = await erpService.updateProject(req.user.tenantId, req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'ERP Project updated successfully.',
        data: project,
      });
    } catch (error) {
      next(error);
    }
  }

  // Sales Orders
  async getSalesOrders(req, res, next) {
    try {
      const orders = await erpService.getSalesOrders(req.user.tenantId, req.query);
      return res.status(200).json({
        success: true,
        count: orders.length,
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  }

  // Purchase Orders
  async getPurchaseOrders(req, res, next) {
    try {
      const pos = await erpService.getPurchaseOrders(req.user.tenantId, req.query);
      return res.status(200).json({
        success: true,
        count: pos.length,
        data: pos,
      });
    } catch (error) {
      next(error);
    }
  }

  async createPurchaseOrder(req, res, next) {
    try {
      const po = await erpService.createPurchaseOrder(req.user.tenantId, req.body);
      return res.status(201).json({
        success: true,
        message: 'Purchase Order created successfully.',
        data: po,
      });
    } catch (error) {
      next(error);
    }
  }

  // Inventory
  async getInventory(req, res, next) {
    try {
      const items = await erpService.getInventory(req.user.tenantId, req.query);
      return res.status(200).json({
        success: true,
        count: items.length,
        data: items,
      });
    } catch (error) {
      next(error);
    }
  }

  async createInventoryItem(req, res, next) {
    try {
      const item = await erpService.createInventoryItem(req.user.tenantId, req.body);
      return res.status(201).json({
        success: true,
        message: 'Inventory SKU added successfully.',
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ErpController();
