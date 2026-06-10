import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Database
import { connectDB, isDBConnected } from './config/db.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import watchlistRoutes from './routes/watchlistRoutes.js';
import predictRoutes from './routes/predictRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import portfolioRoutes from './routes/portfolioRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import marketRoutes from './routes/marketRoutes.js';

// Middleware
import {
  notFound,
  errorHandler
} from './middleware/errorMiddleware.js';

// Load environment variables
dotenv.config();

// Connect database
connectDB();

const app = express();

// =========================
// MIDDLEWARE
// =========================

// Dynamic CORS whitelist
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Native Rate Limiter to protect endpoints
const ipRequestCounts = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 mins window
const RATE_LIMIT_MAX_REQUESTS = 250; // max 250 requests per IP per window

const rateLimiter = (req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const currentTime = Date.now();
  
  if (!ipRequestCounts.has(ip)) {
    ipRequestCounts.set(ip, { count: 1, windowStart: currentTime });
    return next();
  }
  
  const clientData = ipRequestCounts.get(ip);
  if (currentTime - clientData.windowStart > RATE_LIMIT_WINDOW_MS) {
    clientData.count = 1;
    clientData.windowStart = currentTime;
    ipRequestCounts.set(ip, clientData);
    return next();
  }
  
  clientData.count += 1;
  ipRequestCounts.set(ip, clientData);
  
  if (clientData.count > RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({
      error: 'Too many requests from this IP. Please try again after 15 minutes.'
    });
  }
  
  next();
};

app.use('/api', rateLimiter);

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

// =========================
// ROOT ROUTE
// =========================
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message:
      'AI Stock Predictor API Server is running.',
    timestamp:
      new Date().toISOString()
  });
});

// =========================
// DATABASE STATUS
// =========================
app.get('/api/status', (req, res) => {
  res.json({
    dbConnected:
      isDBConnected
  });
});

// =========================
// API ROUTES
// =========================
app.use('/api/auth', authRoutes);

app.use('/api/user', userRoutes);

app.use(
  '/api/watchlist',
  watchlistRoutes
);

app.use(
  '/api/predict',
  predictRoutes
);

app.use(
  '/api/history',
  historyRoutes
);

app.use(
  '/api/portfolio',
  portfolioRoutes
);

app.use(
  '/api/alerts',
  alertRoutes
);

app.use(
  '/api/market',
  marketRoutes
);

// =========================
// ERROR HANDLING
// =========================
app.use(notFound);
app.use(errorHandler);

// =========================
// SERVER START
// =========================
const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 [Server] Running in ${process.env.NODE_ENV ||
    'development'
    } mode on port ${PORT}`
  );
});