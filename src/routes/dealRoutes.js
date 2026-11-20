const express = require('express');
const router = express.Router();
const dealController = require('../controllers/dealController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

// Deal Read permissions: All 12 platform personas under this company tenant
const DEAL_READ_ROLES = [
  'SUPER_ADMIN',
  'BUSINESS_OWNER',
  'OPERATIONS_SALES_ADMIN',
  'FINANCE_COMPLIANCE_ADMIN',
  'CRM_PRO',
  'AI_MARKETING_PRO',
  'AFFILIATE_PARTNER',
  'INFLUENCER',
  'CONTENT_CREATOR',
  'CONTENT_BUILDER',
  'HR',
  'CUSTOMER',
];

const DEAL_CREATE_ROLES = [
  'SUPER_ADMIN',
  'BUSINESS_OWNER',
  'OPERATIONS_SALES_ADMIN',
  'CRM_PRO',
  'AFFILIATE_PARTNER',
  'CUSTOMER',
];

const DEAL_UPDATE_ROLES = [
  'SUPER_ADMIN',
  'BUSINESS_OWNER',
  'OPERATIONS_SALES_ADMIN',
  'CRM_PRO',
  'AFFILIATE_PARTNER',
  'CUSTOMER',
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
