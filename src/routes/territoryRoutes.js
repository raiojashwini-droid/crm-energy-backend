const express = require('express');
const router = express.Router();
const territoryController = require('../controllers/territoryController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

const TERRITORY_READ_ROLES = [
  'SUPER_ADMIN',
  'BUSINESS_OWNER',
  'OPERATIONS_SALES_ADMIN',
  'AFFILIATE_PARTNER',
];

const TERRITORY_WRITE_ROLES = [
  'SUPER_ADMIN',
  'BUSINESS_OWNER',
  'OPERATIONS_SALES_ADMIN',
];

const TERRITORY_DELETE_ROLES = [
  'SUPER_ADMIN',
  'BUSINESS_OWNER',
];

router.get('/', authorizeRoles(...TERRITORY_READ_ROLES), territoryController.getAll);
router.get('/:id', authorizeRoles(...TERRITORY_READ_ROLES), territoryController.getById);
router.post('/', authorizeRoles(...TERRITORY_WRITE_ROLES), territoryController.create);
router.put('/:id', authorizeRoles(...TERRITORY_WRITE_ROLES), territoryController.update);
router.delete('/:id', authorizeRoles(...TERRITORY_DELETE_ROLES), territoryController.delete);

module.exports = router;
