const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

const USER_DIRECTORY_ROLES = [
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

router.get('/', authorizeRoles(...USER_DIRECTORY_ROLES), userController.getAll);
router.put('/profile', userController.updateProfile);
router.put('/company', authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'OPERATIONS_SALES_ADMIN'), userController.updateCompany);

// Allow user to view their own profile, or administrative roles to view any member
router.get('/:id', (req, res, next) => {
  if (req.user && (req.user.userId === req.params.id || req.user.id === req.params.id)) {
    return next();
  }
  return authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'OPERATIONS_SALES_ADMIN', 'CRM_PRO', 'HR')(req, res, next);
}, userController.getById);

module.exports = router;
