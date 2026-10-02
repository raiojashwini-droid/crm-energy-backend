const authService = require('../services/authService');

class AuthController {
  async register(req, res, next) {
    try {
      const { companyName, name, email, password, role, domain } = req.body;
      const data = await authService.register({
        companyName,
        name,
        email,
        password,
        role,
        domain,
      });

      return res.status(201).json({
        success: true,
        message: 'Organization workspace created and user registered successfully.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const data = await authService.login({ email, password });

      return res.status(200).json({
        success: true,
        message: 'Authentication successful.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      const data = await authService.getMe(req.user.userId);

      return res.status(200).json({
        success: true,
        message: 'Current authenticated user profile retrieved.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      return res.status(200).json({
        success: true,
        message: 'Logged out successfully.',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
