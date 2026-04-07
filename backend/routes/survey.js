const express = require('express');
const router = express.Router();
const { submitSurvey, getSurveyResult, getAllSurveys, getQuestions, getQuestionsForUser, addQuestion, deleteQuestion } = require('../controllers/surveyController');
const { authenticateAdmin } = require('../middleware/auth');

router.post('/submit-survey', submitSurvey);
router.get('/survey-result/:userId', getSurveyResult);
router.get('/all-surveys', authenticateAdmin, getAllSurveys);
router.get('/questions', getQuestions);
router.get('/questions/:userId', getQuestionsForUser);
router.post('/questions', authenticateAdmin, addQuestion);
router.delete('/questions/:id', authenticateAdmin, deleteQuestion);

module.exports = router;


