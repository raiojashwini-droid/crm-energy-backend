const express = require('express');
const router = express.Router();
const dealController = require('../controllers/dealController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

const DEAL_READ_ROLES = [
  'SUPER_ADMIN',
  'BUSINESS_OWNER',
  'OPERATIONS_SALES_ADMIN',
  'FINANCE_COMPLIANCE_ADMIN',
  'CRM_PRO',
  'AI_MARKETING_PRO',
  'AFFILIATE_PARTNER',
];

const DEAL_CREATE_ROLES = [
  'SUPER_ADMIN',
  'BUSINESS_OWNER',
  'OPERATIONS_SALES_ADMIN',
  'CRM_PRO',
  'AFFILIATE_PARTNER',
];

const DEAL_UPDATE_ROLES = [
  'SUPER_ADMIN',
  'BUSINESS_OWNER',
  'OPERATIONS_SALES_ADMIN',
  'CRM_PRO',
  'AFFILIATE_PARTNER',
];

const DEAL_DELETE_ROLES = [
  'SUPER_ADMIN',
  'BUSINESS_OWNER',
  'OPERATIONS_SALES_ADMIN',
];

router.get('/', authorizeRoles(...DEAL_READ_ROLES), dealController.getAll);
router.get('/:id', authorizeRoles(...DEAL_READ_ROLES), dealController.getById);
router.post('/', authorizeRoles(...DEAL_CREATE_ROLES), dealController.create);
router.put('/:id', authorizeRoles(...DEAL_UPDATE_ROLES), dealController.update);
router.delete('/:id', authorizeRoles(...DEAL_DELETE_ROLES), dealController.delete);

module.exports = router;
