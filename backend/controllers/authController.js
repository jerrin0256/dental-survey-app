const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

let twilio;
try {
  twilio = require('twilio');
} catch (e) {
  console.log("WARN: Twilio module not installed. Real SMS won't work.");
}

// Initialize Twilio
const client = twilio && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// Simple in-memory OTP store (works always, no DB needed)
const otpStore = new Map();

// Clean expired OTPs every minute
setInterval(() => {
  const now = Date.now();
  for (const [phone, data] of otpStore.entries()) {
    if (data.expiresAt < now) {
      otpStore.delete(phone);
    }
  }
}, 60000);

// POST /send-otp - FAST, NO DB NEEDED
const sendOtp = async (req, res) => {
  try {
    const { phone } = req.validated;

    // Generate 4-digit OTP
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store in memory (instant, no DB wait)
    otpStore.set(phone, { otp: generatedOtp, expiresAt });
    console.log(`[OTP] Generated for ${phone}: ${generatedOtp}`);
    
    if (client) {
      try {
        await client.messages.create({
          body: `Your Dental Survey App OTP: ${generatedOtp}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phone.startsWith('+') ? phone : `+91${phone}`
        });
        console.log(`[SMS] Sent to ${phone}`);
        res.json({ message: 'OTP sent via SMS' });
      } catch (error) {
        console.error('Twilio Error:', error.message);
        res.json({ message: 'OTP sent (simulated)', testOtp: generatedOtp });
      }
    } else {
      // Return OTP for testing
      res.json({ message: 'OTP sent (simulated)', testOtp: generatedOtp });
    }
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
};

// POST /verify-otp - FAST, NO DB NEEDED
const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.validated;

    // Get from memory (instant)
    const stored = otpStore.get(phone);
    
    if (!stored || stored.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (stored.expiresAt < Date.now()) {
      otpStore.delete(phone);
      return res.status(400).json({ message: 'OTP expired' });
    }

    // Clear OTP
    otpStore.delete(phone);
    console.log(`[OTP] Verified for ${phone}`);

    // Check if user exists (with timeout)
    let user = null;
    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findOne({ phone }).maxTimeMS(3000);
      } catch (err) {
        console.log('[User] DB slow, skipping user check');
      }
    }
    
    res.json({ message: 'OTP verified', user: user || null });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ message: 'Failed to verify OTP', error: error.message });
  }
};

// POST /register - FAST
const register = async (req, res) => {
  try {
    const { name, age, phone, gender, address } = req.body;
    
    if (!name || !age || !phone) {
      return res.status(400).json({ message: 'Name, age, and phone required' });
    }

    let user = { _id: phone, name, age, phone, gender, address };
    
    // Try to save to DB (but don't wait if slow)
    if (mongoose.connection.readyState === 1) {
      User.findOneAndUpdate(
        { phone },
        { name, age, phone, gender, address },
        { upsert: true, new: true }
      ).maxTimeMS(3000)
      .then(dbUser => {
        console.log('[Registration] Saved to DB');
      })
      .catch(err => {
        console.log('[Registration] DB slow, but user can proceed');
      });
    }
    
    // Return immediately (don't wait for DB)
    res.status(201).json({ message: 'Registration successful', user });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

// POST /admin-login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim();
    const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH?.trim();
    const JWT_SECRET = process.env.JWT_SECRET?.trim();

    console.log('Admin Login Attempt:', { email, ADMIN_EMAIL });

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD_HASH || !JWT_SECRET) {
      return res.status(500).json({ message: 'Admin or JWT configuration is missing' });
    }

    if (email !== ADMIN_EMAIL) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    console.log('Password validation:', isValid);
    
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

module.exports = { sendOtp, verifyOtp, register, adminLogin };

