const router = require('express').Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middlewares/authMiddleware');
const { validateCategory } = require('../middlewares/validateMiddleware');

router.use(authMiddleware);

router.get('/', categoryController.getCategories);
router.post('/', validateCategory, categoryController.createCategory);
router.put('/:id', validateCategory, categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
