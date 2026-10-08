const express = require('express');
const router = express.Router();
const manufacturingController = require('../controllers/manufacturingController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

const MFG_ACCESS_ROLES = [
  'SUPER_ADMIN',
  'BUSINESS_OWNER',
  'OPERATIONS_SALES_ADMIN',
  'FINANCE_COMPLIANCE_ADMIN',
];

const MFG_WRITE_ROLES = [
  'SUPER_ADMIN',
  'BUSINESS_OWNER',
  'OPERATIONS_SALES_ADMIN',
];

router.get('/orders', authorizeRoles(...MFG_ACCESS_ROLES), manufacturingController.getOrders);
router.post('/orders', authorizeRoles(...MFG_WRITE_ROLES), manufacturingController.createOrder);
router.put('/orders/:id', authorizeRoles(...MFG_WRITE_ROLES), manufacturingController.updateOrder);

module.exports = router;
