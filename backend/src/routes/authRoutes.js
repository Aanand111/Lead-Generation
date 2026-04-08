const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');
const { sendOTP, resetPassword } = require('../controllers/passwordResetController');
const validate = require('../middlewares/validate');
const { registerSchema, loginSchema } = require('../utils/validators');

const router = express.Router();

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);

// Password Reset via OTP (OTP is printed in backend terminal)
router.post('/forgot-password', sendOTP);
router.post('/reset-password', resetPassword);

module.exports = router;
