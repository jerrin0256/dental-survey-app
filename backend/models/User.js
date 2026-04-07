const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true },
    phone: { type: String, required: true, unique: true },
    gender: { type: String },
    address: { type: String },
  },
  { timestamps: true }
);

// Add index for faster queries
userSchema.index({ phone: 1 });

module.exports = mongoose.model('User', userSchema);
