const router = require('express').Router();
const alertController = require('../controllers/alertController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/', alertController.lowStock);
router.get('/resumen', alertController.getSummary);

module.exports = router;
