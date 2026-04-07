require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const compression = require('compression');
const winston = require('winston');

const authRoutes = require('./routes/auth');
const surveyRoutes = require('./routes/survey');

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'dental-survey-api' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// CORS with specific origin
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'your-frontend-domain.com' : '*',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', authRoutes);
app.use('/api', surveyRoutes);

app.get('/', (req, res) => res.json({ message: 'Dental Survey API running' }));

// Global error handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({
    message,
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

const PORT = process.env.PORT || 5000;

// Start server first so it stays alive
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Attempt connection but catch it globally to prevent crash
const connectWithRetry = () => {
  logger.info('Attempting to connect to MongoDB Atlas...');
  mongoose
    .connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s
    })
    .then(() => {
      logger.info('MongoDB connected successfully');
    })
    .catch((err) => {
      logger.error('CRITICAL: MongoDB Atlas connection failed.', err);
      logger.info('Retrying in 10 seconds...');
      setTimeout(connectWithRetry, 10000);
    });
};

connectWithRetry();

// Error handling to prevent unhandled rejections from crashing the process
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});
