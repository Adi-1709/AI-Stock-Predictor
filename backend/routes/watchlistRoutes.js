import express from 'express';
import { getWatchlist, addWatchlistItem, removeWatchlistItem } from '../controllers/watchlistController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getWatchlist)
  .post(protect, addWatchlistItem);

router.route('/:symbol')
  .delete(protect, removeWatchlistItem);

export default router;
