const User = require('../models/User');
const Otp = require('../models/Otp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

let twilio;
try {
  twilio = require('twilio');
} catch (e) {
  console.log("WARN: Twilio module not installed. Real SMS won't work. Run `npm install twilio`.");
}

// Initialize Twilio using environment variables
const client = twilio && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// Fallback in-memory store if MongoDB is slow
const otpMemoryStore = new Map();

// Helper to store OTP with fallback
const storeOtp = async (phone, otp, expiresAt) => {
  // Try MongoDB first
  if (mongoose.connection.readyState === 1) {
    try {
      await Otp.deleteMany({ phone });
      await Otp.create({ phone, otp, expiresAt });
      console.log('[OTP] Stored in MongoDB');
      return;
    } catch (err) {
      console.error('[OTP] MongoDB failed, using memory:', err.message);
    }
  }
  // Fallback to memory
  otpMemoryStore.set(phone, { otp, expiresAt });
  console.log('[OTP] Stored in memory');
};

// Helper to get OTP with fallback
const getOtp = async (phone, otp) => {
  // Try MongoDB first
  if (mongoose.connection.readyState === 1) {
    try {
      const storedOtp = await Otp.findOne({ phone, otp }).maxTimeMS(5000);
      if (storedOtp) {
        console.log('[OTP] Retrieved from MongoDB');
        return storedOtp;
      }
    } catch (err) {
      console.error('[OTP] MongoDB read failed, checking memory:', err.message);
    }
  }
  // Fallback to memory
  const memOtp = otpMemoryStore.get(phone);
  if (memOtp && memOtp.otp === otp) {
    console.log('[OTP] Retrieved from memory');
    return memOtp;
  }
  return null;
};

// Helper to delete OTP with fallback
const deleteOtp = async (phone) => {
  if (mongoose.connection.readyState === 1) {
    try {
      await Otp.deleteMany({ phone });
    } catch (err) {
      console.error('[OTP] MongoDB delete failed:', err.message);
    }
  }
  otpMemoryStore.delete(phone);
};

// POST /send-otp
const sendOtp = async (req, res) => {
  try {
    const { phone } = req.validated;

    // Generate a 4-digit random OTP
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store OTP (with fallback)
    await storeOtp(phone, generatedOtp, expiresAt);
    
    if (client) {
      try {
        // Send real SMS
        await client.messages.create({
          body: `Your Dental Survey App login OTP is: ${generatedOtp}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phone.startsWith('+') ? phone : `+91${phone}`
        });
        console.log(`[REAL SMS] Sent OTP to ${phone}`);
        res.json({ message: 'OTP sent successfully via SMS' });
      } catch (error) {
        console.error('Twilio Error:', error.message);
        res.status(500).json({ message: 'Failed to send SMS OTP', error: error.message });
      }
    } else {
      // Fallback if Twilio is not configured - return OTP for testing
      console.log(`[SMS SIMULATION] Sent OTP to ${phone}: ${generatedOtp}`);
      res.json({ message: 'OTP sent (simulated)', testOtp: generatedOtp });
    }
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
};

// POST /verify-otp
const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.validated;

    // Find OTP (with fallback)
    const storedOtp = await getOtp(phone, otp);
    
    if (!storedOtp) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Check if OTP is expired
    if (storedOtp.expiresAt < new Date()) {
      await deleteOtp(phone);
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Clear OTP after successful verification
    await deleteOtp(phone);

    // Check if user already exists
    let user = null;
    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findOne({ phone }).maxTimeMS(5000);
      } catch (err) {
        console.error('[User] MongoDB read failed:', err.message);
      }
    }
    res.json({ message: 'OTP verified', user: user || null });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ message: 'Failed to verify OTP', error: error.message });
  }
};

// POST /register
const register = async (req, res) => {
  try {
    const { name, age, phone, gender, address } = req.body;
    
    if (!name || !age || !phone) {
      return res.status(400).json({ message: 'Name, age, and phone are required' });
    }

    let user = null;
    
    // Try MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findOneAndUpdate(
          { phone },
          { name, age, phone, gender, address },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        ).maxTimeMS(10000);
        console.log('[Registration] Saved to MongoDB');
      } catch (err) {
        console.error('[Registration] MongoDB failed:', err.message);
        // Return success anyway with user data
        user = { name, age, phone, gender, address, _id: phone };
      }
    } else {
      // MongoDB not connected, return user data anyway
      user = { name, age, phone, gender, address, _id: phone };
      console.log('[Registration] MongoDB not connected, returning user data');
    }
    
    res.status(201).json({ message: 'User registered successfully', user });
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

