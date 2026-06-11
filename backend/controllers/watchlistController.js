import { db } from '../config/firebase.js';

/**
 * @desc    Get user watchlist
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
    
    res.json(items);
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
