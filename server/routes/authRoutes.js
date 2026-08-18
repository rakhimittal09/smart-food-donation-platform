const express = require('express');
const router = express.Router();
const { register, login, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { registerRules, loginRules } = require('../middleware/validator');

router.post('/register', registerRules, register);
router.post('/login', loginRules, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
