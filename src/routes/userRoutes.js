const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', userController.getAll);
router.put('/profile', userController.updateProfile);
router.put('/company', userController.updateCompany);
router.get('/:id', userController.getById);

module.exports = router;
