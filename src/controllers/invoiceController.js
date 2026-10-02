const invoiceService = require('../services/invoiceService');

class InvoiceController {
  async getAll(req, res, next) {
    try {
      const invoices = await invoiceService.getAll(req.user.tenantId, req.query);
      return res.status(200).json({
        success: true,
        count: invoices.length,
        data: invoices,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const invoice = await invoiceService.getById(req.user.tenantId, req.params.id);
      return res.status(200).json({
        success: true,
        data: invoice,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const invoice = await invoiceService.create(req.user.tenantId, req.body);
      return res.status(201).json({
        success: true,
        message: 'Invoice created successfully.',
        data: invoice,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const invoice = await invoiceService.update(req.user.tenantId, req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Invoice updated successfully.',
        data: invoice,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await invoiceService.delete(req.user.tenantId, req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Invoice deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InvoiceController();
