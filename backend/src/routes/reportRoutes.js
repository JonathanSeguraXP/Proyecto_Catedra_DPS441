const router = require('express').Router();
const reportService = require('../services/reportService');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/inventario', reportService.inventoryReport);
router.get('/movimientos', reportService.movementsReport);
router.get('/ventas', reportService.salesReport);

module.exports = router;
