const express = require('express');
const authController = require('./auth.controller');
const validate = require('../../middlewares/validate');
const { registerSchema, loginSchema } = require('../../utils/validators');

// Note: passwordResetController should ideally be modularized too
const { sendOTP, resetPassword } = require('../../controllers/passwordResetController');

const router = express.Router();

router.post('/register', validate(registerSchema), (req, res, next) => authController.register(req, res, next));
router.post('/login', validate(loginSchema), (req, res, next) => authController.login(req, res, next));

// Temporary: keeping old controllers for non-modularized parts
router.post('/forgot-password', sendOTP);
router.post('/reset-password', resetPassword);

module.exports = router;
