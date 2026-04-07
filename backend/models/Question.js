const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    category: { type: String, default: 'General' },
    options: { type: [String], default: ['No', 'Yes'] },
    scores: { type: [Number], default: [0, 1] }, // Scores corresponding to options
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', questionSchema);
