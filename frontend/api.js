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
import Constants from 'expo-constants';
import { Platform } from 'react-native';

/** Used for release APKs when EXPO_PUBLIC_API_URL was not set at build time (10.0.2.2 only works on emulator). */
const PRODUCTION_API_URL = 'https://dental-survey-app.onrender.com/api';

const expoConfig = Constants.expoConfig || Constants.manifest || {};
const debuggerHost =
  typeof expoConfig.debuggerHost === 'string' ? expoConfig.debuggerHost :
  typeof expoConfig.hostUri === 'string' ? expoConfig.hostUri :
  typeof expoConfig.packagerOpts?.url === 'string' ? expoConfig.packagerOpts.url :
  null;
const localDebugHost = typeof debuggerHost === 'string' ? debuggerHost.split(':').shift() : null;
const emulatorHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
/**
 * Must match backend listen port (`process.env.PORT` in server.js, else 5000).
 * Set expo.extra.apiPort in app.json or EXPO_PUBLIC_DEV_API_PORT in frontend/.env if your backend uses another port (e.g. 5001).
 */
const extraPort = expoConfig.extra?.apiPort;
const LOCAL_API_PORT = String(
  process.env.EXPO_PUBLIC_DEV_API_PORT ??
    (extraPort !== undefined && extraPort !== null && String(extraPort).trim() !== ''
      ? extraPort
      : '5000')
).trim();
const LOCAL_API_FALLBACK = `http://${localDebugHost || emulatorHost}:${LOCAL_API_PORT}/api`;

const extraApiRaw = expoConfig.extra?.apiBaseUrl;
const extraApi =
  typeof extraApiRaw === 'string' && extraApiRaw.trim().length > 0
    ? extraApiRaw.trim()
    : null;

/** Set `expo.extra.useProductionApiInDev` to true in app.json to use Render while testing in Expo Go (e.g. PC off or different network). */
const useProductionInDev = expoConfig.extra?.useProductionApiInDev === true;

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  extraApi ||
  (useProductionInDev && __DEV__
    ? PRODUCTION_API_URL
    : __DEV__
      ? LOCAL_API_FALLBACK
      : PRODUCTION_API_URL);

const API_TIMEOUT = 30000; // Increased to 30 seconds for slow connections

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
    if (__DEV__) {
      console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.warn('Request setup failed:', error?.message || error);
    return Promise.reject(error);
  }
);

// Response interceptor — use console.warn so RN LogBox does not show a full-screen "Console Error" for normal API/network failures.
API.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log(`✅ ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status}`);
    }
    return response;
  },
  (error) => {
    if (error.response) {
      console.warn(`API ${error.response.status} ${error.config?.url || ''}`, error.response.data);
    } else if (error.request) {
      console.warn(
        'Network error (no response). Is the backend running and reachable?',
        API_BASE_URL
      );
    } else {
      console.warn('Request error:', error.message);
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
