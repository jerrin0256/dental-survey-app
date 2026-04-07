const Survey = require('../models/Survey');
const Question = require('../models/Question');
const User = require('../models/User');

// GET /questions
const getQuestions = async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch questions', error: err.message });
  }
};

// GET /questions/:userId - Get 10 random questions for user, create survey if not exists
const getQuestionsForUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findOne({ phone: userId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    let survey = await Survey.findOne({ user: user._id });
    if (!survey) {
      // Get all questions
      const allQuestions = await Question.find();
      // Shuffle and pick 10
      const shuffled = allQuestions.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 10);
      // Create survey with questions
      survey = await Survey.create({ user: user._id, questions: selected.map(q => q._id), answers: {}, score: 0 });
    }
    // Populate questions
    await survey.populate('questions');
    res.json(survey.questions);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch questions', error: err.message });
  }
};

// POST /questions
const addQuestion = async (req, res) => {
  const { text, category, options, scores } = req.body;
  if (!text) return res.status(400).json({ message: 'Question text is required' });

  try {
    const question = await Question.create({ text, category, options, scores });
    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add question', error: err.message });
  }
};

// DELETE /questions/:id
const deleteQuestion = async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: 'Question deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete question', error: err.message });
  }
};


// Determine status label from score
const getStatus = (score) => {
  if (score <= 5) return 'Good';
  if (score <= 10) return 'Satisfactory';
  return 'Poor';
};

// POST /submit-survey
const submitSurvey = async (req, res) => {
  const { userId, answers, score } = req.body;
  if (!userId || answers === undefined || score === undefined) {
    return res.status(400).json({ message: 'userId, answers, and score are required' });
  }

  try {
    const user = await User.findOne({ phone: userId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Find existing survey to preserve questions array
    let survey = await Survey.findOne({ user: user._id });
    if (survey) {
      // Update existing survey, preserve questions
      survey.answers = answers;
      survey.score = score;
      await survey.save();
    } else {
      // Create new survey (shouldn't happen if getQuestionsForUser was called first)
      survey = await Survey.create({ user: user._id, answers, score, questions: [] });
    }
    res.status(201).json({ message: 'Survey submitted', survey });
  } catch (err) {
    res.status(500).json({ message: 'Submission failed', error: err.message });
  }
};

// GET /survey-result/:userId
const getSurveyResult = async (req, res) => {
  try {
    const user = await User.findOne({ phone: req.params.userId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const survey = await Survey.findOne({ user: user._id }).sort({ createdAt: -1 });
    if (!survey) return res.status(404).json({ message: 'No survey found for this user' });

    res.json({
      survey,
      status: getStatus(survey.score),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch result', error: err.message });
  }
};

const getAllSurveys = async (req, res) => {
  try {
    const surveys = await Survey.find().populate('user', 'name age phone gender address').sort({ createdAt: -1 });
    res.json(surveys);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch all surveys', error: err.message });
  }
};

module.exports = { submitSurvey, getSurveyResult, getAllSurveys, getQuestions, getQuestionsForUser, addQuestion, deleteQuestion };


