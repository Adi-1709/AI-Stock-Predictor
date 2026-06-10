import express from 'express';
import { getHistory, getStats, createHistoryLog } from '../controllers/historyController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getHistory)
  .post(protect, createHistoryLog);

router.get('/stats', protect, getStats);

export default router;
