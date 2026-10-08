const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/sub-accounts', authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'OPERATIONS_SALES_ADMIN'), tenantController.getSubAccounts);
router.post('/sub-accounts', authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER'), tenantController.createSubAccount);
router.get('/settings', authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'OPERATIONS_SALES_ADMIN', 'FINANCE_COMPLIANCE_ADMIN'), tenantController.getSettings);
router.put('/settings', authorizeRoles('SUPER_ADMIN', 'BUSINESS_OWNER', 'OPERATIONS_SALES_ADMIN'), tenantController.updateSettings);

module.exports = router;
