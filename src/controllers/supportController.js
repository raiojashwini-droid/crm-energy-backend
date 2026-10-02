const supportService = require('../services/supportService');

class SupportController {
  // Tickets
  async getTickets(req, res, next) {
    try {
      const tickets = await supportService.getTickets(req.user.tenantId, req.query);
      return res.status(200).json({
        success: true,
        count: tickets.length,
        data: tickets,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTicketById(req, res, next) {
    try {
      const ticket = await supportService.getTicketById(req.user.tenantId, req.params.id);
      return res.status(200).json({
        success: true,
        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  }

  async createTicket(req, res, next) {
    try {
      const ticket = await supportService.createTicket(req.user.tenantId, req.body);
      return res.status(201).json({
        success: true,
        message: 'Support ticket submitted.',
        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTicket(req, res, next) {
    try {
      const ticket = await supportService.updateTicket(req.user.tenantId, req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Ticket updated successfully.',
        data: ticket,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTicket(req, res, next) {
    try {
      await supportService.deleteTicket(req.user.tenantId, req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Ticket deleted.',
      });
    } catch (error) {
      next(error);
    }
  }

  // Articles
  async getArticles(req, res, next) {
    try {
      const articles = await supportService.getArticles(req.user.tenantId, req.query);
      return res.status(200).json({
        success: true,
        count: articles.length,
        data: articles,
      });
    } catch (error) {
      next(error);
    }
  }

  async createArticle(req, res, next) {
    try {
      const article = await supportService.createArticle(req.user.tenantId, req.body);
      return res.status(201).json({
        success: true,
        message: 'Knowledge base article created.',
        data: article,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SupportController();
