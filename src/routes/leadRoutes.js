const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Public Lead Creation (No auth required — Website Sign-Up / Consultation Forms)
router.post('/public', leadController.createPublic);

// Protect subsequent lead routes with JWT authentication
router.use(authenticateToken);

// Lead Read permissions: All authenticated platform personas under this company tenant
const LEAD_READ_ROLES = [
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

// Lead Create permissions: Sales, Marketing, Affiliates, Influencers, Leadership, and Customers
const LEAD_CREATE_ROLES = [
  'SUPER_ADMIN',
  'BUSINESS_OWNER',
  'OPERATIONS_SALES_ADMIN',
  'CRM_PRO',
  'AI_MARKETING_PRO',
  'AFFILIATE_PARTNER',
  'INFLUENCER',
  'CUSTOMER',
];

// Lead Modification permissions: Active pipeline managers
const LEAD_UPDATE_ROLES = [
  'SUPER_ADMIN',
  'BUSINESS_OWNER',
  'OPERATIONS_SALES_ADMIN',
  'CRM_PRO',
  'AI_MARKETING_PRO',
  'AFFILIATE_PARTNER',
  'CUSTOMER',
];

// Lead Conversion permissions: Qualified sales personnel
const LEAD_CONVERT_ROLES = [
  'SUPER_ADMIN',
  'BUSINESS_OWNER',
  'OPERATIONS_SALES_ADMIN',
  'CRM_PRO',
];

// Lead Deletion permissions: Administrative & executive authorities only
const LEAD_DELETE_ROLES = [
  'SUPER_ADMIN',
  'BUSINESS_OWNER',
  'OPERATIONS_SALES_ADMIN',
];

router.get('/', authorizeRoles(...LEAD_READ_ROLES), leadController.getAll);
router.get('/:id', authorizeRoles(...LEAD_READ_ROLES), leadController.getById);
router.post('/', authorizeRoles(...LEAD_CREATE_ROLES), leadController.create);
router.put('/:id', authorizeRoles(...LEAD_UPDATE_ROLES), leadController.update);
router.delete('/:id', authorizeRoles(...LEAD_DELETE_ROLES), leadController.delete);
router.post('/:id/convert', authorizeRoles(...LEAD_CONVERT_ROLES), leadController.convert);

module.exports = router;
