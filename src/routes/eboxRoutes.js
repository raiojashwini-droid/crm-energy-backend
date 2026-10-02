const express = require('express');
const router = express.Router();
const eboxController = require('../controllers/eboxController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', eboxController.getMessages);
router.post('/', eboxController.sendMessage);

module.exports = router;
