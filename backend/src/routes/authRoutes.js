const router = require('express').Router();
const authController = require('../controllers/authController');
const { validateRegister } = require('../middlewares/validateMiddleware');

router.post('/register', validateRegister, authController.register);
router.post('/login', authController.login);

module.exports = router;
