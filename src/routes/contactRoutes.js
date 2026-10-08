const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

const CONTACT_READ_ROLES = [
  'SUPER_ADMIN',
  'BUSINESS_OWNER',
  'OPERATIONS_SALES_ADMIN',
  'FINANCE_COMPLIANCE_ADMIN',
  'CRM_PRO',
  'CUSTOMER',
];

const CONTACT_WRITE_ROLES = [
  'SUPER_ADMIN',
  'BUSINESS_OWNER',
  'OPERATIONS_SALES_ADMIN',
  'CRM_PRO',
];

const CONTACT_DELETE_ROLES = [
  'SUPER_ADMIN',
  'BUSINESS_OWNER',
  'OPERATIONS_SALES_ADMIN',
];

const CONTACT_BULK_ROLES = [
  'SUPER_ADMIN',
  'BUSINESS_OWNER',
];

router.get('/', authorizeRoles(...CONTACT_READ_ROLES), contactController.getAll);
router.post('/bulk-delete', authorizeRoles(...CONTACT_BULK_ROLES), contactController.bulkDelete);
router.get('/:id', authorizeRoles(...CONTACT_READ_ROLES), contactController.getById);
router.post('/', authorizeRoles(...CONTACT_WRITE_ROLES), contactController.create);
router.put('/:id', authorizeRoles(...CONTACT_WRITE_ROLES), contactController.update);
router.delete('/:id', authorizeRoles(...CONTACT_DELETE_ROLES), contactController.delete);

module.exports = router;
