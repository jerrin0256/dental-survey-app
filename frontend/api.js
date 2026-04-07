// import axios from 'axios';
// import Constants from 'expo-constants';
// import { API_BASE_URL, API_TIMEOUT } from './constants';

// const API_URL = API_BASE_URL;
// console.log("READY: Backend connected at:", API_URL);

// const API = axios.create({
//   baseURL: API_URL,
//   timeout: API_TIMEOUT
// });

// export const sendOtp = (phone) => API.post('/send-otp', { phone });
// export const verifyOtp = (phone, otp) => API.post('/verify-otp', { phone, otp });
// export const registerUser = (data) => API.post('/register', data);
// export const submitSurvey = (userId, answers, score) => API.post('/submit-survey', { userId, answers, score });
// export const getSurveyResult = (userId) => API.get(`/survey-result/${userId}`);
// export const adminLogin = (email, password) => API.post('/admin-login', { email, password });
// export const getAllSurveys = () => API.get('/all-surveys');
// export const getQuestions = () => API.get('/questions');
// export const getQuestionsForUser = (userId) => API.get(`/questions/${userId}`);
// export const addQuestion = (data) => API.post('/questions', data);
// export const deleteQuestion = (id) => API.delete(`/questions/${id}`);


import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.29.38:5001/api';
const API_TIMEOUT = 15000;

console.log("🔗 Backend API URL:", API_BASE_URL);

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - Add token to requests
API.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
API.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(`❌ API Error [${error.response.status}]:`, error.response.data);
    } else if (error.request) {
      console.error('❌ Network Error - No response received:', error.message);
    } else {
      console.error('❌ Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export const sendOtp = (phone) => API.post('/send-otp', { phone });
export const verifyOtp = (phone, otp) => API.post('/verify-otp', { phone, otp });
export const registerUser = (data) => API.post('/register', data);
export const submitSurvey = (userId, answers, score) => API.post('/submit-survey', { userId, answers, score });
export const getSurveyResult = (userId) => API.get(`/survey-result/${userId}`);
export const adminLogin = (email, password) => API.post('/admin-login', { email, password });
export const getAllSurveys = () => API.get('/all-surveys');
export const getQuestions = () => API.get('/questions');
export const getQuestionsForUser = (userId) => API.get(`/questions/${userId}`);
export const addQuestion = (data) => API.post('/questions', data);
export const deleteQuestion = (id) => API.delete(`/questions/${id}`);

export default API;
