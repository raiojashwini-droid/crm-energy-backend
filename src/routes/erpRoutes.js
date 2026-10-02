const express = require('express');
const router = express.Router();
const erpController = require('../controllers/erpController');
const { authenticateToken } = require('../middleware/auth');

// Protect all ERP routes with JWT authentication & tenant isolation
router.use(authenticateToken);

// CRM Deal -> ERP Handoff
router.post('/handoff-deal/:dealId', erpController.handoffFromDeal);

// Projects
router.get('/projects', erpController.getProjects);
router.get('/projects/:id', erpController.getProjectById);
router.post('/projects', erpController.createProject);
router.put('/projects/:id', erpController.updateProject);

// Sales Orders
router.get('/sales-orders', erpController.getSalesOrders);

// Purchase Orders (Procurement)
router.get('/purchase-orders', erpController.getPurchaseOrders);
router.post('/purchase-orders', erpController.createPurchaseOrder);

// Inventory
router.get('/inventory', erpController.getInventory);
router.post('/inventory', erpController.createInventoryItem);

module.exports = router;
