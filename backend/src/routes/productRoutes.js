const router = require('express').Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middlewares/authMiddleware');
const { validateProduct } = require('../middlewares/validateMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.use(authMiddleware);

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.post('/', upload.single('imagen'), validateProduct, productController.createProduct);
router.put('/:id', upload.single('imagen'), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
