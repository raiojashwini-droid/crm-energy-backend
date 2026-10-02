const express = require('express');
const router = express.Router();
const hrController = require('../controllers/hrController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

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
