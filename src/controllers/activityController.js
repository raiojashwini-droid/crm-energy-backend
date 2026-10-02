const activityService = require('../services/activityService');

class ActivityController {
  async getAll(req, res, next) {
    try {
      const activities = await activityService.getAll(req.user.tenantId, req.query);
      return res.status(200).json({
        success: true,
        count: activities.length,
        data: activities,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const activity = await activityService.create(req.user.tenantId, req.body, req.user.userId);
      return res.status(201).json({
        success: true,
        message: 'Activity logged successfully.',
        data: activity,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ActivityController();
