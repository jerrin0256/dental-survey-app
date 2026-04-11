const express = require('express');
const router = express.Router();
const { sendOtp, verifyOtp, register, adminLogin } = require('../controllers/authController');
const validateRequest = require('../middleware/validator');
const { otpLimiter, verifyOtpLimiter, adminLoginLimiter } = require('../middleware/rateLimit');
const joi = require('joi');

const phoneField = joi
  .string()
  .trim()
  .min(10)
  .max(16)
  .required()
  .messages({ 'string.min': 'Enter a valid mobile number (at least 10 digits)' });

router.post('/send-otp', otpLimiter, validateRequest(
  joi.object({ phone: phoneField })
), sendOtp);

router.post('/verify-otp', verifyOtpLimiter, validateRequest(
  joi.object({
    phone: phoneField,
    otp: joi.string().trim().pattern(/^\d{4}$/).required().messages({
      'string.pattern.base': 'OTP must be exactly 4 digits',
    }),
  })
), verifyOtp);

router.post('/register', validateRequest(
  joi.object({
    name: joi.string().min(2).required(),
    age: joi.number().integer().min(1).max(120).required(),
    phone: phoneField,
    gender: joi.string().valid('Male', 'Female', 'Other'),
    address: joi.string().allow('').optional()
  })
), register);

router.post('/admin-login', adminLoginLimiter, validateRequest(
  joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(4).required()
  })
), adminLogin);

module.exports = router;

