const express = require('express');
const router = express.Router();
const hrController = require('../controllers/hrController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

// HR Module access: strictly restricted to HR Directors, Business Owners & Super Admin
const HR_AUTHORIZED_ROLES = ['SUPER_ADMIN', 'BUSINESS_OWNER', 'HR'];

router.use(authorizeRoles(...HR_AUTHORIZED_ROLES));

// Employees
router.get('/employees', hrController.getEmployees);
router.get('/employees/:id', hrController.getEmployeeById);
router.post('/employees', hrController.createEmployee);
router.put('/employees/:id', hrController.updateEmployee);
router.delete('/employees/:id', hrController.deleteEmployee);

// Candidates
router.get('/candidates', hrController.getCandidates);
router.post('/candidates', hrController.createCandidate);
router.put('/candidates/:id', hrController.updateCandidate);
router.delete('/candidates/:id', hrController.deleteCandidate);

module.exports = router;

