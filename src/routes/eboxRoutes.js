const express = require('express');
const router = express.Router();
const eboxController = require('../controllers/eboxController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);
router.use(authorizeRoles('BUSINESS_OWNER', 'SUPER_ADMIN'));

router.get('/', eboxController.getMessages);
router.post('/', eboxController.sendMessage);

module.exports = router;
