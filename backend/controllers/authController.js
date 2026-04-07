const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

// In-memory OTP store with TTL { phone: { otp, expiresAt } }
const otpStore = new Map();

// Helper to clean expired OTPs
const cleanExpiredOtps = () => {
  const now = Date.now();
  for (const [phone, data] of otpStore.entries()) {
    if (data.expiresAt < now) {
      otpStore.delete(phone);
    }
  }
};

// POST /send-otp
const sendOtp = async (req, res) => {
  const { phone } = req.validated;
  cleanExpiredOtps();

  // Generate a real 6-digit random OTP
  const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
  otpStore.set(phone, {
    otp: generatedOtp,
    expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
  });
  
  if (client) {
    try {
      // Send real SMS
      await client.messages.create({
        body: `Your Dental Survey App login OTP is: ${generatedOtp}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone.startsWith('+') ? phone : `+91${phone}` // Assumes India code (+91) if not provided. Adjust as needed!
      });
      console.log(`[REAL SMS] Sent OTP to ${phone}`);
      res.json({ message: 'Real OTP sent successfully via SMS' });
    } catch (error) {
       console.error('Twilio Error:', error.message);
       res.status(500).json({ message: 'Failed to send SMS OTP. Check Twilio credentials.', error: error.message });
    }
  } else {
    // Fallback if Twilio is not configured
    console.log(`[SMS SIMULATION] Sent OTP to ${phone}: ${generatedOtp}`);
    res.json({ message: 'Simulated OTP sent', testOtp: generatedOtp });
  }
};

// POST /verify-otp
const verifyOtp = async (req, res) => {
  const { phone, otp } = req.validated;
  cleanExpiredOtps();

  const storedData = otpStore.get(phone);
  if (!storedData || storedData.otp !== otp || storedData.expiresAt < Date.now()) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  // Clear OTP after successful verification
  otpStore.delete(phone);

  // Check if user already exists
  const user = await User.findOne({ phone });
  res.json({ message: 'OTP verified', user: user || null });
};

// POST /register
const register = async (req, res) => {
  const { name, age, phone, gender, address } = req.body;
  if (!name || !age || !phone) return res.status(400).json({ message: 'All fields required' });

  try {
    // Upsert: update if exists, create if not
    const user = await User.findOneAndUpdate(
      { phone },
      { name, age, phone, gender, address },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json({ message: 'User registered', user });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

// POST /admin-login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim();
    const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH?.trim();

    console.log('Admin Login Attempt:', { email, ADMIN_EMAIL });

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD_HASH) {
      return res.status(500).json({ message: 'Admin credentials not configured' });
    }

    if (email !== ADMIN_EMAIL) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    console.log('Password validation:', isValid);
    
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

module.exports = { sendOtp, verifyOtp, register, adminLogin };

