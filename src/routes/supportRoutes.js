const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Tickets
router.get('/tickets', supportController.getTickets);
router.get('/tickets/:id', supportController.getTicketById);
router.post('/tickets', supportController.createTicket);
router.put('/tickets/:id', supportController.updateTicket);
router.delete('/tickets/:id', supportController.deleteTicket);

// Knowledge Base Articles
router.get('/articles', supportController.getArticles);
router.post('/articles', supportController.createArticle);

module.exports = router;
