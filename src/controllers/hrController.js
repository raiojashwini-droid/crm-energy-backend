const hrService = require('../services/hrService');

class HrController {
  // Employees
  async getEmployees(req, res, next) {
    try {
      const employees = await hrService.getEmployees(req.user.tenantId, req.query);
      return res.status(200).json({
        success: true,
        count: employees.length,
        data: employees,
      });
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeById(req, res, next) {
    try {
      const employee = await hrService.getEmployeeById(req.user.tenantId, req.params.id);
      return res.status(200).json({
        success: true,
        data: employee,
      });
    } catch (error) {
      next(error);
    }
  }

  async createEmployee(req, res, next) {
    try {
      const employee = await hrService.createEmployee(req.user.tenantId, req.body);
      return res.status(201).json({
        success: true,
        message: 'Employee registered successfully.',
        data: employee,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateEmployee(req, res, next) {
    try {
      const employee = await hrService.updateEmployee(req.user.tenantId, req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Employee record updated.',
        data: employee,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteEmployee(req, res, next) {
    try {
      await hrService.deleteEmployee(req.user.tenantId, req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Employee record deleted.',
      });
    } catch (error) {
      next(error);
    }
  }

  // Candidates
  async getCandidates(req, res, next) {
    try {
      const candidates = await hrService.getCandidates(req.user.tenantId, req.query);
      return res.status(200).json({
        success: true,
        count: candidates.length,
        data: candidates,
      });
    } catch (error) {
      next(error);
    }
  }

  async createCandidate(req, res, next) {
    try {
      const candidate = await hrService.createCandidate(req.user.tenantId, req.body);
      return res.status(201).json({
        success: true,
        message: 'Candidate added to pipeline.',
        data: candidate,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCandidate(req, res, next) {
    try {
      const candidate = await hrService.updateCandidate(req.user.tenantId, req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Candidate stage updated.',
        data: candidate,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCandidate(req, res, next) {
    try {
      await hrService.deleteCandidate(req.user.tenantId, req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Candidate deleted.',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new HrController();
