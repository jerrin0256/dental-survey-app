const mongoose = require('mongoose');

const surveySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }], // Assigned questions for this user
    answers: { type: Map, of: Number, required: true }, // { questionId: selectedOptionIndex }
    score: { type: Number, required: true },
  },
  { timestamps: true }
);

// Add indexes for faster queries
surveySchema.index({ user: 1 });
surveySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Survey', surveySchema);
