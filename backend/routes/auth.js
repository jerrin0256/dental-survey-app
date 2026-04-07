const express = require('express');
const router = express.Router();
const { sendOtp, verifyOtp, register, adminLogin } = require('../controllers/authController');
const validateRequest = require('../middleware/validator');
const { otpLimiter, adminLoginLimiter } = require('../middleware/rateLimit');
const joi = require('joi');

router.post('/send-otp', otpLimiter, validateRequest(
  joi.object({ phone: joi.string().regex(/^\d{10}$/).required() })
), sendOtp);

router.post('/verify-otp', validateRequest(
  joi.object({ phone: joi.string().required(), otp: joi.string().length(4).required() })
), verifyOtp);

router.post('/register', validateRequest(
  joi.object({
    name: joi.string().min(2).required(),
    age: joi.number().integer().min(1).max(120).required(),
    phone: joi.string().regex(/^\d{10}$/).required(),
    gender: joi.string().valid('Male', 'Female', 'Other'),
    address: joi.string()
  })
), register);

router.post('/admin-login', adminLoginLimiter, validateRequest(
  joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(4).required()
  })
), adminLogin);

module.exports = router;

