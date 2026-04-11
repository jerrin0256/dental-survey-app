const User = require('../models/User');
const Otp = require('../models/Otp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

let twilio;
try {
  twilio = require('twilio');
} catch (e) {
  console.log('WARN: Twilio module not installed. Real SMS won\'t work.');
}

const client = twilio && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

/** In-memory fallback when MongoDB is not connected (local dev without DB). */
const otpStore = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [phone, data] of otpStore.entries()) {
    if (data.expiresAt < now) otpStore.delete(phone);
  }
}, 60000);

function normalizePhone(input) {
  if (input == null || typeof input !== 'string') return null;
  let d = input.replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  if (d.length === 10) return d;
  return null;
}

/** Always keep in-memory copy (same server). Mongo when connected (multi-instance / reliable). */
async function storeOtp(phone, otp, expiresAtMs) {
  const otpStr = String(otp).trim();
  otpStore.set(phone, { otp: otpStr, expiresAt: expiresAtMs });
  if (mongoose.connection.readyState === 1) {
    try {
      await Otp.findOneAndUpdate(
        { phone },
        { phone, otp: otpStr, expiresAt: new Date(expiresAtMs) },
        { upsert: true }
      );
    } catch (e) {
      console.error('[OTP] Mongo store failed (memory still holds code on this process):', e.message);
    }
  }
}

/** Prefer Mongo when connected (Render / multiple instances); fall back to memory if DB misses or fails. */
async function loadOtp(phone) {
  const now = Date.now();
  if (mongoose.connection.readyState === 1) {
    try {
      const doc = await Otp.findOne({ phone });
      if (doc) {
        if (doc.expiresAt.getTime() < now) {
          await Otp.deleteOne({ _id: doc._id });
        } else {
          return { otp: String(doc.otp).trim(), expiresAt: doc.expiresAt.getTime() };
        }
      }
    } catch (e) {
      console.error('[OTP] Mongo load failed, using memory if present:', e.message);
    }
  }
  const m = otpStore.get(phone);
  if (!m) return null;
  if (m.expiresAt < now) {
    otpStore.delete(phone);
    return null;
  }
  return { otp: String(m.otp).trim(), expiresAt: m.expiresAt };
}

async function removeOtp(phone) {
  otpStore.delete(phone);
  if (mongoose.connection.readyState === 1) {
    await Otp.deleteOne({ phone });
  }
}

const sendOtp = async (req, res) => {
  try {
    const phone = normalizePhone(req.validated.phone);
    if (!phone) {
      return res.status(400).json({ message: 'Enter a valid 10-digit mobile number' });
    }

    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;
    await storeOtp(phone, generatedOtp, expiresAt);
    console.log(`[OTP] Generated for ${phone}: ${generatedOtp}`);

    const exposeCodeInResponse =
      process.env.SHOW_OTP_IN_RESPONSE === '1' ||
      process.env.SHOW_OTP_IN_RESPONSE === 'true' ||
      process.env.NODE_ENV !== 'production';

    if (client) {
      try {
        await client.messages.create({
          body: `Your Dental Survey App OTP: ${generatedOtp}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phone.startsWith('+') ? phone : `+91${phone}`,
        });
        console.log(`[SMS] Sent to ${phone}`);
        const payload = { message: 'OTP sent via SMS' };
        if (exposeCodeInResponse) payload.testOtp = generatedOtp;
        return res.json(payload);
      } catch (error) {
        console.error('Twilio Error:', error.message);
        return res.json({
          message: 'SMS could not be sent; use the code below',
          testOtp: generatedOtp,
        });
      }
    }

    return res.json({ message: 'OTP sent (simulated)', testOtp: generatedOtp });
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const phone = normalizePhone(req.validated.phone);
    if (!phone) {
      return res.status(400).json({ message: 'Enter a valid 10-digit mobile number' });
    }
    const otpEntered = String(req.validated.otp).trim();

    const stored = await loadOtp(phone);
    if (!stored || stored.otp !== otpEntered) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    await removeOtp(phone);
    console.log(`[OTP] Verified for ${phone}`);

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

const register = async (req, res) => {
  try {
    const { name, age, gender, address } = req.validated;
    const phone = normalizePhone(req.validated.phone);
    if (!phone) {
      return res.status(400).json({ message: 'Invalid phone number' });
    }

    const user = { _id: phone, name, age, phone, gender, address };

    if (mongoose.connection.readyState === 1) {
      User.findOneAndUpdate(
        { phone },
        { name, age, phone, gender, address },
        { upsert: true, new: true }
      )
        .maxTimeMS(3000)
        .then(() => console.log('[Registration] Saved to DB'))
        .catch(() => console.log('[Registration] DB slow, but user can proceed'));
    }

    res.status(201).json({ message: 'Registration successful', user });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.validated;
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim();
    const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH?.trim();
    const JWT_SECRET = process.env.JWT_SECRET?.trim();

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD_HASH || !JWT_SECRET) {
      return res.status(500).json({ message: 'Admin or JWT configuration is missing' });
    }

    if (email !== ADMIN_EMAIL) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
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
