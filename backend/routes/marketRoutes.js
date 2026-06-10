import express from 'express';
import { getIndices, getMovers, getTrending, getSummary } from '../controllers/marketController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/indices', protect, getIndices);
router.get('/movers', protect, getMovers);
router.get('/trending', protect, getTrending);
router.get('/summary', protect, getSummary);

export default router;
