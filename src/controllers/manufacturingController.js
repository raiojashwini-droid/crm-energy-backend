const manufacturingService = require('../services/manufacturingService');

class ManufacturingController {
  async getOrders(req, res, next) {
    try {
      const orders = await manufacturingService.getOrders(req.user.tenantId, req.query);
      return res.status(200).json({
        success: true,
        count: orders.length,
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  }

  async createOrder(req, res, next) {
    try {
      const order = await manufacturingService.createOrder(req.user.tenantId, req.body);
      return res.status(201).json({
        success: true,
        message: 'Production order created.',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateOrder(req, res, next) {
    try {
      const order = await manufacturingService.updateOrder(req.user.tenantId, req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Production order updated.',
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ManufacturingController();
