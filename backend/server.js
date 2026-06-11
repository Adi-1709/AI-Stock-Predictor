import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Initialize Firebase Admin (this must be imported early)
import './config/firebase.js';

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

// Set up detailed CORS to handle Vercel deployment and local dev
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173'];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Native Rate Limiter to protect endpoints
const ipRequestCounts = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 mins window
const RATE_LIMIT_MAX_REQUESTS = 250; // max 250 requests per IP per window

app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const currentTime = Date.now();

  if (!ipRequestCounts.has(ip)) {
    ipRequestCounts.set(ip, { count: 1, resetTime: currentTime + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  const record = ipRequestCounts.get(ip);
  if (currentTime > record.resetTime) {
    ipRequestCounts.set(ip, { count: 1, resetTime: currentTime + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  record.count += 1;
  if (record.count > RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({ message: 'Too many requests, please try again later.' });
  }

  next();
});

// Clean up expired rate limit records periodically
setInterval(() => {
  const currentTime = Date.now();
  for (const [ip, record] of ipRequestCounts.entries()) {
    if (currentTime > record.resetTime) {
      ipRequestCounts.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW_MS);

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/predict', predictRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/market', marketRoutes);

// Root Health Route
app.get('/', (req, res) => {
  res.send('AI Stock Predictor Firebase API is running');
});
app.get("/", (req, res) => {
  res.json({
    message: "Backend Working Successfully"
  });
});

app.get("/api/status", (req, res) => {
  res.json({
    status: "Backend Running Successfully"
  });
});


// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});