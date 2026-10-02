const noteService = require('../services/noteService');

class NoteController {
  async getAll(req, res, next) {
    try {
      const notes = await noteService.getAll(req.user.tenantId, req.query);
      return res.status(200).json({
        success: true,
        count: notes.length,
        data: notes,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const note = await noteService.create(req.user.tenantId, req.body, req.user.userId);
      return res.status(201).json({
        success: true,
        message: 'Note created successfully.',
        data: note,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const note = await noteService.update(req.user.tenantId, req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Note updated successfully.',
        data: note,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await noteService.delete(req.user.tenantId, req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Note deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NoteController();
