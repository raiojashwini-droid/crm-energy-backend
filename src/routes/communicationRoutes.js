const express = require('express');
const router = express.Router();
const communicationController = require('../controllers/communicationController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

const COMMUNICATION_ROLES = [
  'SUPER_ADMIN',
  'BUSINESS_OWNER',
  'OPERATIONS_SALES_ADMIN',
  'CRM_PRO',
  'HR',
  'AFFILIATE_PARTNER',
  'INFLUENCER',
  'CUSTOMER',
];

router.use(authorizeRoles(...COMMUNICATION_ROLES));

router.get('/', communicationController.getAll);
router.get('/:id', communicationController.getById);
router.post('/', communicationController.send);

module.exports = router;
