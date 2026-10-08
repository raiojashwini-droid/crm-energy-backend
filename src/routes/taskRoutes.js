const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

const TASK_CREATE_ROLES = [
  'SUPER_ADMIN',
  'BUSINESS_OWNER',
  'OPERATIONS_SALES_ADMIN',
  'FINANCE_COMPLIANCE_ADMIN',
  'CRM_PRO',
  'HR',
  'AI_MARKETING_PRO',
  'AFFILIATE_PARTNER',
  'CONTENT_CREATOR',
  'CONTENT_BUILDER',
  'INFLUENCER',
];

router.get('/', taskController.getAll);
router.get('/:id', taskController.getById);
router.post('/', authorizeRoles(...TASK_CREATE_ROLES), taskController.create);
router.put('/:id', taskController.update);
router.patch('/:id/toggle', taskController.toggleComplete);
router.delete('/:id', taskController.delete);

module.exports = router;
