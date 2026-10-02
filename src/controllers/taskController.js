const taskService = require('../services/taskService');

class TaskController {
  async getAll(req, res, next) {
    try {
      const tasks = await taskService.getAll(req.user.tenantId, req.query);
      return res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const task = await taskService.getById(req.user.tenantId, req.params.id);
      return res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const task = await taskService.create(req.user.tenantId, req.body, req.user.userId);
      return res.status(201).json({
        success: true,
        message: 'Task created successfully.',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const task = await taskService.update(req.user.tenantId, req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Task updated successfully.',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  async toggleComplete(req, res, next) {
    try {
      const task = await taskService.toggleComplete(req.user.tenantId, req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Task status updated.',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await taskService.delete(req.user.tenantId, req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Task deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TaskController();
