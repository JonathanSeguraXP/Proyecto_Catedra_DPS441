const router = require('express').Router();
const ventaController = require('../controllers/ventaController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/productos', authMiddleware, ventaController.productosDisponibles);
router.post('/', authMiddleware, ventaController.crearVenta);
router.get('/', authMiddleware, ventaController.listarVentas);
router.get('/:id', authMiddleware, ventaController.obtenerVenta);

module.exports = router;
