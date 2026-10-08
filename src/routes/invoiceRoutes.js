const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

const INVOICE_ACCESS_ROLES = [
  'SUPER_ADMIN',
  'BUSINESS_OWNER',
  'OPERATIONS_SALES_ADMIN',
  'FINANCE_COMPLIANCE_ADMIN',
];

const INVOICE_DELETE_ROLES = [
  'SUPER_ADMIN',
  'BUSINESS_OWNER',
];

router.get('/', authorizeRoles(...INVOICE_ACCESS_ROLES), invoiceController.getAll);
router.get('/:id', authorizeRoles(...INVOICE_ACCESS_ROLES), invoiceController.getById);
router.post('/', authorizeRoles(...INVOICE_ACCESS_ROLES), invoiceController.create);
router.put('/:id', authorizeRoles(...INVOICE_ACCESS_ROLES), invoiceController.update);
router.delete('/:id', authorizeRoles(...INVOICE_DELETE_ROLES), invoiceController.delete);

module.exports = router;
