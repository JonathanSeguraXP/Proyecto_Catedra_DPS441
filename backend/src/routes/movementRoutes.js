const router = require('express').Router();
const movementController = require('../controllers/movementController');
const authMiddleware = require('../middlewares/authMiddleware');
const { validateMovement } = require('../middlewares/validateMiddleware');

router.use(authMiddleware);

router.get('/', movementController.getMovements);
router.post('/', validateMovement, movementController.createMovement);

module.exports = router;
