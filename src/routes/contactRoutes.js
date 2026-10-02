const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', contactController.getAll);
router.post('/bulk-delete', contactController.bulkDelete);
router.get('/:id', contactController.getById);
router.post('/', contactController.create);
router.put('/:id', contactController.update);
router.delete('/:id', contactController.delete);

module.exports = router;
