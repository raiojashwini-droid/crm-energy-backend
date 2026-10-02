const express = require('express');
const router = express.Router();
const communicationController = require('../controllers/communicationController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', communicationController.getAll);
router.get('/:id', communicationController.getById);
router.post('/', communicationController.send);

module.exports = router;
