const User = require('../models/User');
const Otp = require('../models/Otp');
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

// POST /send-otp
const sendOtp = async (req, res) => {
  try {
    const { phone } = req.validated;

    // Generate a 4-digit random OTP
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Delete any existing OTP for this phone
    await Otp.deleteMany({ phone });

    // Store OTP in MongoDB
    await Otp.create({
      phone,
      otp: generatedOtp,
      expiresAt
    });
    
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

    // Find OTP in database
    const storedOtp = await Otp.findOne({ phone, otp });
    
    if (!storedOtp) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Check if OTP is expired
    if (storedOtp.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: storedOtp._id });
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Clear OTP after successful verification
    await Otp.deleteOne({ _id: storedOtp._id });

    // Check if user already exists
    const user = await User.findOne({ phone });
    res.json({ message: 'OTP verified', user: user || null });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ message: 'Failed to verify OTP', error: error.message });
  }
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

