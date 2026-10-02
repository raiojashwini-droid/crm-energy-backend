const eboxService = require('../services/eboxService');

class EboxController {
  async getMessages(req, res, next) {
    try {
      const messages = await eboxService.getMessages(req.user.tenantId);
      return res.status(200).json({
        success: true,
        count: messages.length,
        data: messages,
      });
    } catch (error) {
      next(error);
    }
  }

  async sendMessage(req, res, next) {
    try {
      const message = await eboxService.sendMessage(req.user.tenantId, req.user.userId, req.body);
      return res.status(201).json({
        success: true,
        message: 'Encrypted message transmitted to Kiaan Tech Team.',
        data: message,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EboxController();
