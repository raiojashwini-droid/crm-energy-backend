const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const { authenticateToken } = require('../middleware/auth');

// Protect all lead routes with JWT authentication
router.use(authenticateToken);

router.get('/', leadController.getAll);
router.get('/:id', leadController.getById);
router.post('/', leadController.create);
router.put('/:id', leadController.update);
router.delete('/:id', leadController.delete);
router.post('/:id/convert', leadController.convert);

module.exports = router;
