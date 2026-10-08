const express = require('express');
const router = express.Router();
const erpController = require('../controllers/erpController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Protect all ERP routes with JWT authentication & tenant isolation
router.use(authenticateToken);

// Core ERP Operations & Financial Management Roles
const ERP_CORE_ROLES = [
  'SUPER_ADMIN',
  'BUSINESS_OWNER',
  'OPERATIONS_SALES_ADMIN',
  'FINANCE_COMPLIANCE_ADMIN',
];

// CRM Deal -> ERP Project Handoff Roles (Sales Leads + Operations + Execs)
const ERP_HANDOFF_ROLES = [
  'SUPER_ADMIN',
  'BUSINESS_OWNER',
  'OPERATIONS_SALES_ADMIN',
  'CRM_PRO',
];

// CRM Deal -> ERP Handoff
router.post('/handoff-deal/:dealId', authorizeRoles(...ERP_HANDOFF_ROLES), erpController.handoffFromDeal);

// Projects
router.get('/projects', authorizeRoles(...ERP_CORE_ROLES), erpController.getProjects);
router.get('/projects/:id', authorizeRoles(...ERP_CORE_ROLES), erpController.getProjectById);
router.post('/projects', authorizeRoles(...ERP_CORE_ROLES), erpController.createProject);
router.put('/projects/:id', authorizeRoles(...ERP_CORE_ROLES), erpController.updateProject);

// Sales Orders
router.get('/sales-orders', authorizeRoles(...ERP_CORE_ROLES), erpController.getSalesOrders);

// Purchase Orders (Procurement)
router.get('/purchase-orders', authorizeRoles(...ERP_CORE_ROLES), erpController.getPurchaseOrders);
router.post('/purchase-orders', authorizeRoles(...ERP_CORE_ROLES), erpController.createPurchaseOrder);

// Inventory
router.get('/inventory', authorizeRoles(...ERP_CORE_ROLES), erpController.getInventory);
router.post('/inventory', authorizeRoles(...ERP_CORE_ROLES), erpController.createInventoryItem);

module.exports = router;

