const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/sub-accounts', tenantController.getSubAccounts);
router.post('/sub-accounts', tenantController.createSubAccount);
router.get('/settings', tenantController.getSettings);
router.put('/settings', tenantController.updateSettings);

module.exports = router;
