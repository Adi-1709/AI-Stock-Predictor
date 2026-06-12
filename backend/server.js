import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Firebase
import './config/firebase.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import watchlistRoutes from './routes/watchlistRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import predictRoutes from './routes/predictRoutes.js';
import portfolioRoutes from './routes/portfolioRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import marketRoutes from './routes/marketRoutes.js';

dotenv.config();

const app = express();

app.use(express.json());

/* ===========================
   CORS CONFIG
=========================== */

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
    'http://localhost:5173',
    'https://ai-stock-predictor-zeta.vercel.app'
  ];

const corsOptions = {
  origin: function (origin, callback) {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      allowedOrigins.includes('*')
    ) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
};

app.use(cors(corsOptions));

/* ===========================
   RATE LIMIT FIX
=========================== */

// Increased request limit
const ipRequestCounts = new Map();

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 mins

// Increased from 250 → 10000
const RATE_LIMIT_MAX_REQUESTS = 10000;

app.use((req, res, next) => {
  const ip =
    req.headers['x-forwarded-for'] ||
    req.socket.remoteAddress ||
    req.ip;

  const currentTime = Date.now();

  if (!ipRequestCounts.has(ip)) {
    ipRequestCounts.set(ip, {
      count: 1,
      resetTime:
        currentTime +
        RATE_LIMIT_WINDOW_MS
    });

    return next();
  }

  const record =
    ipRequestCounts.get(ip);

  if (
    currentTime >
    record.resetTime
  ) {
    ipRequestCounts.set(ip, {
      count: 1,
      resetTime:
        currentTime +
        RATE_LIMIT_WINDOW_MS
    });

    return next();
  }

  record.count += 1;

  if (
    record.count >
    RATE_LIMIT_MAX_REQUESTS
  ) {
    return res.status(429).json({
      success: false,
      message:
        'Too many requests. Please try again later.'
    });
  }

  next();
});

// Cleanup memory
setInterval(() => {
  const currentTime =
    Date.now();

  for (const [
    ip,
    record
  ] of ipRequestCounts.entries()) {
    if (
      currentTime >
      record.resetTime
    ) {
      ipRequestCounts.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW_MS);

/* ===========================
   ROUTES
=========================== */

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/predict', predictRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/market', marketRoutes);

/* ===========================
   HEALTH CHECK ROUTES
=========================== */

app.get('/', (req, res) => {
  res.json({
    success: true,
    message:
      'AI Stock Predictor Backend Running 🚀'
  });
});

app.get(
  '/api/status',
  (req, res) => {
    res.json({
      success: true,
      status:
        'Backend Running Successfully'
    });
  }
);

/* ===========================
   ERROR HANDLER
=========================== */

app.use(notFound);
app.use(errorHandler);

/* ===========================
   SERVER
=========================== */

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV ||
    'development'
    } mode on port ${PORT}`
  );
});