const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Protect all lead routes with JWT authentication
router.use(authenticateToken);

// Lead Read/Create permissions: Sales, Marketing, Affiliates, Influencers, Leadership
const LEAD_READ_WRITE_ROLES = [
  'SUPER_ADMIN',
  'BUSINESS_OWNER',
  'OPERATIONS_SALES_ADMIN',
  'CRM_PRO',
  'AI_MARKETING_PRO',
  'AFFILIATE_PARTNER',
  'INFLUENCER',
];

// Lead Modification permissions: Active pipeline managers
const LEAD_UPDATE_ROLES = [
  'SUPER_ADMIN',
  'BUSINESS_OWNER',
  'OPERATIONS_SALES_ADMIN',
  'CRM_PRO',
  'AI_MARKETING_PRO',
  'AFFILIATE_PARTNER',
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

router.get('/', authorizeRoles(...LEAD_READ_WRITE_ROLES), leadController.getAll);
router.get('/:id', authorizeRoles(...LEAD_READ_WRITE_ROLES), leadController.getById);
router.post('/', authorizeRoles(...LEAD_READ_WRITE_ROLES), leadController.create);
router.put('/:id', authorizeRoles(...LEAD_UPDATE_ROLES), leadController.update);
router.delete('/:id', authorizeRoles(...LEAD_DELETE_ROLES), leadController.delete);
router.post('/:id/convert', authorizeRoles(...LEAD_CONVERT_ROLES), leadController.convert);

module.exports = router;

