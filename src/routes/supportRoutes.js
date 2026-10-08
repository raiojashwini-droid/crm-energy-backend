const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

// Support Ticket Interaction Roles (Staff & Customers)
const TICKET_ACCESS_ROLES = [
  'SUPER_ADMIN',
  'BUSINESS_OWNER',
  'OPERATIONS_SALES_ADMIN',
  'CRM_PRO',
  'CUSTOMER',
];

// Support Ticket Deletion Roles (Administrative authorities only)
const TICKET_DELETE_ROLES = [
  'SUPER_ADMIN',
  'BUSINESS_OWNER',
  'OPERATIONS_SALES_ADMIN',
];

// Knowledge Base Article Publishing Roles
const ARTICLE_PUBLISH_ROLES = [
  'SUPER_ADMIN',
  'BUSINESS_OWNER',
  'CRM_PRO',
  'CONTENT_BUILDER',
  'OPERATIONS_SALES_ADMIN',
];

// Knowledge Base Article Read Roles (All authenticated workspace members)
const ARTICLE_READ_ROLES = [
  'SUPER_ADMIN',
  'BUSINESS_OWNER',
  'CUSTOMER',
  'CONTENT_CREATOR',
  'CONTENT_BUILDER',
  'CRM_PRO',
  'OPERATIONS_SALES_ADMIN',
  'FINANCE_COMPLIANCE_ADMIN',
  'HR',
  'AI_MARKETING_PRO',
  'AFFILIATE_PARTNER',
  'INFLUENCER',
];

// Tickets
router.get('/tickets', authorizeRoles(...TICKET_ACCESS_ROLES), supportController.getTickets);
router.get('/tickets/:id', authorizeRoles(...TICKET_ACCESS_ROLES), supportController.getTicketById);
router.post('/tickets', authorizeRoles(...TICKET_ACCESS_ROLES), supportController.createTicket);
router.put('/tickets/:id', authorizeRoles(...TICKET_ACCESS_ROLES), supportController.updateTicket);
router.delete('/tickets/:id', authorizeRoles(...TICKET_DELETE_ROLES), supportController.deleteTicket);

// Knowledge Base Articles
router.get('/articles', authorizeRoles(...ARTICLE_READ_ROLES), supportController.getArticles);
router.post('/articles', authorizeRoles(...ARTICLE_PUBLISH_ROLES), supportController.createArticle);

module.exports = router;

