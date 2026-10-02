const communicationService = require('../services/communicationService');

class CommunicationController {
  async getAll(req, res, next) {
    try {
      const messages = await communicationService.getAll(req.user.tenantId, req.query);
      return res.status(200).json({
        success: true,
        count: messages.length,
        data: messages,
      });
    } catch (error) {
      next(error);
    }
  }

  async send(req, res, next) {
    try {
      const message = await communicationService.send(req.user.tenantId, req.user.userId, req.body);
      const isConfigured = message.status !== 'NOT_CONFIGURED';
      return res.status(201).json({
        success: true,
        message: isConfigured ? 'Message dispatched successfully.' : 'Message saved with status NOT_CONFIGURED (Provider credentials not configured).',
        data: message,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const message = await communicationService.getById(req.user.tenantId, req.params.id);
      return res.status(200).json({
        success: true,
        data: message,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CommunicationController();
