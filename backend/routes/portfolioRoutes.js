import express from 'express';
import { getPortfolios, buyVirtualStock, sellVirtualStock } from '../controllers/portfolioController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Secure all endpoints under auth protection middleware
router.use(protect);

router.get('/', getPortfolios);
router.post('/buy', buyVirtualStock);
router.post('/sell', sellVirtualStock);

export default router;
