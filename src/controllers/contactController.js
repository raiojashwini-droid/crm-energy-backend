const contactService = require('../services/contactService');

class ContactController {
  async getAll(req, res, next) {
    try {
      const contacts = await contactService.getAll(req.user.tenantId, req.query);
      return res.status(200).json({
        success: true,
        count: contacts.length,
        data: contacts,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const contact = await contactService.getById(req.user.tenantId, req.params.id);
      return res.status(200).json({
        success: true,
        data: contact,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const contact = await contactService.create(req.user.tenantId, req.body, req.user.userId);
      return res.status(201).json({
        success: true,
        message: 'Contact created successfully.',
        data: contact,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const contact = await contactService.update(req.user.tenantId, req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Contact updated successfully.',
        data: contact,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await contactService.delete(req.user.tenantId, req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Contact deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  }

  async bulkDelete(req, res, next) {
    try {
      const { ids } = req.body;
      const result = await contactService.bulkDelete(req.user.tenantId, ids);
      return res.status(200).json({
        success: true,
        message: `${result.count} contacts deleted successfully.`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ContactController();
