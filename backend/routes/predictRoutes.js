import express from 'express';
import { getStockPrediction, getStockHistory, getStockNews } from '../controllers/predictController.js';
import { handleAIChat } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/history/:symbol', protect, getStockHistory);
router.get('/news/:symbol', protect, getStockNews);
router.post('/ai-chat', protect, handleAIChat);
router.get('/:symbol', protect, getStockPrediction);

export default router;
