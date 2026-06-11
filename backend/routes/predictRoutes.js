import express from 'express';
import {
    getStockPrediction,
    getStockHistory,
    getStockNews
} from '../controllers/predictController.js';

import { handleAIChat } from '../controllers/chatController.js';

const router = express.Router();

// REMOVE protect middleware for now
router.get('/history/:symbol', getStockHistory);
router.get('/news/:symbol', getStockNews);
router.post('/ai-chat', handleAIChat);
router.get('/:symbol', getStockPrediction);

export default router;