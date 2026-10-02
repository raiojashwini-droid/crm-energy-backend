const express = require('express');
const router = express.Router();
const manufacturingController = require('../controllers/manufacturingController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/orders', manufacturingController.getOrders);
router.post('/orders', manufacturingController.createOrder);
router.put('/orders/:id', manufacturingController.updateOrder);

module.exports = router;
