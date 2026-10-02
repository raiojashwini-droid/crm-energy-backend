const userService = require('../services/userService');

class UserController {
  async getAll(req, res, next) {
    try {
      const users = await userService.getAll(req.user.tenantId, req.query);
      return res.status(200).json({
        success: true,
        count: users.length,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const user = await userService.getById(req.user.tenantId, req.params.id);
      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const user = await userService.updateProfile(req.user.userId, req.user.tenantId, req.body);
      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCompany(req, res, next) {
    try {
      const tenant = await userService.updateCompany(req.user.tenantId, req.body);
      return res.status(200).json({
        success: true,
        message: 'Company workspace settings updated successfully.',
        data: tenant,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
