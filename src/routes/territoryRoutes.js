const express = require('express');
const router = express.Router();
const territoryController = require('../controllers/territoryController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', territoryController.getAll);
router.get('/:id', territoryController.getById);
router.post('/', territoryController.create);
router.put('/:id', territoryController.update);
router.delete('/:id', territoryController.delete);

module.exports = router;
