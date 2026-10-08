const prisma = require('../config/prisma');

class HrService {
  // --- Employees ---
  async getEmployees(tenantId, query = {}) {
    const { department, search } = query;
    const where = { tenantId };

    if (department && department !== 'all') {
      where.department = department;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { department: { contains: search } },
        { designation: { contains: search } },
        { employeeId: { contains: search } },
      ];
    }

    return await prisma.hrEmployee.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getEmployeeById(tenantId, id) {
    const employee = await prisma.hrEmployee.findFirst({
      where: { id, tenantId },
    });
    if (!employee) {
      const err = new Error('Employee not found.');
      err.statusCode = 404;
      throw err;
    }
    return employee;
  }

  async createEmployee(tenantId, data) {
    if (!data.name || !data.email) {
      const err = new Error('Employee name and email are required.');
      err.statusCode = 400;
      throw err;
    }

    const employeeId = data.employeeId || `EMP-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`;

    return await prisma.hrEmployee.create({
      data: {
        tenantId,
        employeeId,
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone || null,
        department: data.department || 'Operations',
        designation: data.designation || 'Staff',
        salary: parseFloat(data.salary) || 0,
        joiningDate: data.joiningDate ? new Date(data.joiningDate) : new Date(),
        status: data.status || 'Active',
        payrollStatus: data.payrollStatus || 'Processed',
      },
    });
  }

  async updateEmployee(tenantId, id, data) {
    await this.getEmployeeById(tenantId, id);

    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.email !== undefined) updateData.email = data.email.trim();
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.department !== undefined) updateData.department = data.department;
    if (data.designation !== undefined) updateData.designation = data.designation;
    if (data.salary !== undefined) updateData.salary = parseFloat(data.salary) || 0;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.payrollStatus !== undefined) updateData.payrollStatus = data.payrollStatus;

    return await prisma.hrEmployee.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteEmployee(tenantId, id) {
    await this.getEmployeeById(tenantId, id);
    return await prisma.hrEmployee.delete({
      where: { id },
    });
  }

  // --- Candidates & Recruitment ---
  async getCandidates(tenantId, query = {}) {
    const { stage, search } = query;
    const where = { tenantId };

    if (stage && stage !== 'all') {
      where.stage = stage;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { role: { contains: search } },
      ];
    }

    return await prisma.hrCandidate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async createCandidate(tenantId, data) {
    if (!data.name || !data.role) {
      const err = new Error('Candidate name and role are required.');
      err.statusCode = 400;
      throw err;
    }

    return await prisma.hrCandidate.create({
      data: {
        tenantId,
        name: data.name.trim(),
        email: data.email ? data.email.trim() : `candidate-${Date.now()}@domain.io`,
        phone: data.phone || null,
        role: data.role.trim(),
        stage: data.stage || 'Applied',
        score: parseInt(data.score, 10) || 85,
        experience: data.experience || '3+ years',
        resumeUrl: data.resumeUrl || null,
      },
    });
  }

  async updateCandidate(tenantId, id, data) {
    const candidate = await prisma.hrCandidate.findFirst({ where: { id, tenantId } });
    if (!candidate) {
      const err = new Error('Candidate not found.');
      err.statusCode = 404;
      throw err;
    }

    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.email !== undefined) updateData.email = data.email.trim();
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.role !== undefined) updateData.role = data.role.trim();
    if (data.stage !== undefined) updateData.stage = data.stage;
    if (data.score !== undefined) updateData.score = parseInt(data.score, 10);
    if (data.experience !== undefined) updateData.experience = data.experience;

    return await prisma.hrCandidate.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteCandidate(tenantId, id) {
    const candidate = await prisma.hrCandidate.findFirst({ where: { id, tenantId } });
    if (!candidate) {
      const err = new Error('Candidate not found.');
      err.statusCode = 404;
      throw err;
    }
    return await prisma.hrCandidate.delete({ where: { id } });
  }
}

module.exports = new HrService();
