import { db } from '../config/firebase.js';
import yahooFinance2 from 'yahoo-finance2';
import axios from 'axios';
import { getMarketData } from '../utils/marketHelper.js';

const yahooFinance = new yahooFinance2();

const getMockPrice = (symbol) => {
  const mockBaselines = {
    AAPL: 295.95,
    NVDA: 884.80,
    TSLA: 175.34,
    MSFT: 417.20,
    'RELIANCE.NS': 2920.00,
    RELIANCE: 2920.00,
    'TCS.NS': 3845.00,
    TCS: 3845.00,
    'INFY.NS': 1450.50,
    'HDFCBANK.NS': 1580.30
  };
  return mockBaselines[symbol.toUpperCase()] || 150.00;
};

/**
 * @desc    Get user watchlist with current price & market details enrichment
 * @route   GET /api/watchlist
 * @access  Private
 */
export const getWatchlist = async (req, res, next) => {
  try {
    const snapshot = await db.collection('watchlists')
      .where('userId', '==', req.user.id)
      .get();
      
    const items = [];
    snapshot.forEach(doc => {
      items.push({ _id: doc.id, ...doc.data() });
    });

    const flaskUrl = process.env.FLASK_ML_URL;
    
    const enrichedItems = await Promise.all(items.map(async (item) => {
      const sym = item.symbol.toUpperCase();
      let price = null;
      let change = 0;
      let changePercent = 0;

      // 1. Try Flask ML Service first
      if (flaskUrl) {
        try {
          const flaskRes = await axios.get(`${flaskUrl}/predict/${sym}`, { timeout: 3000 });
          if (flaskRes.data) {
            price = flaskRes.data.price;
            changePercent = flaskRes.data.changePercent || 0;
            change = flaskRes.data.change || 0;
          }
        } catch (err) {
          // ignore
        }
      }

      // 2. Try yahooFinance directly in Node
      if (!price) {
        try {
          const quote = await yahooFinance.quote(sym);
          price = quote.regularMarketPrice;
          change = quote.regularMarketChange || 0;
          changePercent = quote.regularMarketChangePercent || 0;
        } catch (err) {
          // 3. Fallback to baseline price
          price = getMockPrice(sym);
          change = (Math.random() - 0.48) * (price * 0.015);
          changePercent = (change / price) * 100;
        }
      }

      const marketInfo = getMarketData(sym, price);

      return {
        ...item,
        price: parseFloat(price.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2)),
        market: marketInfo.market,
        exchange: marketInfo.exchange,
        currency: marketInfo.currency,
        currencySymbol: marketInfo.currencySymbol || '$',
        formatted_price: marketInfo.formatted_price
      };
    }));
    
    res.json(enrichedItems);
  } catch (error) {
    res.status(500);
    next(error);
  }
};

/**
 * @desc    Add item to watchlist
 * @route   POST /api/watchlist
 * @access  Private
 */
export const addWatchlistItem = async (req, res, next) => {
  const { symbol } = req.body;

  if (!symbol) {
    res.status(400);
    return next(new Error('Please provide a stock symbol'));
  }

  try {
    const upperSymbol = symbol.toUpperCase();
    
    // Check if it already exists
    const existing = await db.collection('watchlists')
      .where('userId', '==', req.user.id)
      .where('symbol', '==', upperSymbol)
      .limit(1)
      .get();

    if (!existing.empty) {
      res.status(400);
      return next(new Error('Item already in watchlist'));
    }

    const newItem = {
      userId: req.user.id,
      symbol: upperSymbol,
      createdAt: new Date().toISOString()
    };
    
    const docRef = await db.collection('watchlists').add(newItem);
    
    // Log activity
    await db.collection('activityLogs').add({
      userId: req.user.id,
      action: 'WATCHLIST_ADD',
      details: `Added ${upperSymbol} to watchlist`,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({ _id: docRef.id, ...newItem });
  } catch (error) {
    res.status(500);
    next(error);
  }
};

/**
 * @desc    Remove item from watchlist
 * @route   DELETE /api/watchlist/:symbol
 * @access  Private
 */
export const removeWatchlistItem = async (req, res, next) => {
  const { symbol } = req.params;

  try {
    const upperSymbol = symbol.toUpperCase();
    
    const snapshot = await db.collection('watchlists')
      .where('userId', '==', req.user.id)
      .where('symbol', '==', upperSymbol)
      .get();

    if (snapshot.empty) {
      res.status(404);
      return next(new Error('Item not found in watchlist'));
    }

    // Delete all matching docs
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // Log activity
    await db.collection('activityLogs').add({
      userId: req.user.id,
      action: 'WATCHLIST_REMOVE',
      details: `Removed ${upperSymbol} from watchlist`,
      createdAt: new Date().toISOString()
    });

    res.json({ message: 'Removed from watchlist', symbol: upperSymbol });
  } catch (error) {
    res.status(500);
    next(error);
  }
};
