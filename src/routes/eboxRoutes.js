const express = require('express');
const router = express.Router();
const eboxController = require('../controllers/eboxController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);
router.use(authorizeRoles('BUSINESS_OWNER', 'SUPER_ADMIN', 'OPERATIONS_SALES_ADMIN', 'FINANCE_COMPLIANCE_ADMIN', 'CRM_PRO', 'HR', 'AI_MARKETING_PRO', 'CUSTOMER_SUPPORT'));

router.get('/', eboxController.getMessages);
router.post('/', eboxController.sendMessage);

module.exports = router;
