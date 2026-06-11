import { db } from '../config/firebase.js';

/**
 * @desc    Get user portfolios
 * @route   GET /api/portfolio
 * @access  Private
 */
export const getPortfolios = async (req, res, next) => {
  try {
    const snapshot = await db.collection('portfolios')
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
 * @desc    Buy virtual stock
 * @route   POST /api/portfolio/buy
 * @access  Private
 */
export const buyVirtualStock = async (req, res, next) => {
  const { symbol, shares, buyPrice } = req.body;

  if (!symbol || !shares || !buyPrice) {
    res.status(400);
    return next(new Error('Please provide symbol, shares, and buyPrice'));
  }

  try {
    const upperSymbol = symbol.toUpperCase();
    
    // Check if it already exists
    const existing = await db.collection('portfolios')
      .where('userId', '==', req.user.id)
      .where('symbol', '==', upperSymbol)
      .limit(1)
      .get();

    if (!existing.empty) {
      const doc = existing.docs[0];
      const data = doc.data();
      const newShares = data.shares + shares;
      const newAvgPrice = ((data.shares * data.buyPrice) + (shares * buyPrice)) / newShares;
      
      await doc.ref.update({
        shares: newShares,
        buyPrice: newAvgPrice
      });
      
      const updated = await doc.ref.get();
      
      // Log activity
      await db.collection('activityLogs').add({
        userId: req.user.id,
        action: 'PORTFOLIO_BUY',
        details: `Bought ${shares} additional shares of ${upperSymbol}`,
        createdAt: new Date().toISOString()
      });

      return res.status(200).json({ _id: updated.id, ...updated.data() });
    }

    const newItem = {
      userId: req.user.id,
      symbol: upperSymbol,
      shares,
      buyPrice,
      createdAt: new Date().toISOString()
    };
    
    const docRef = await db.collection('portfolios').add(newItem);
    
    // Log activity
    await db.collection('activityLogs').add({
      userId: req.user.id,
      action: 'PORTFOLIO_BUY',
      details: `Bought ${shares} shares of ${upperSymbol}`,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({ _id: docRef.id, ...newItem });
  } catch (error) {
    res.status(500);
    next(error);
  }
};

/**
 * @desc    Sell virtual stock
 * @route   POST /api/portfolio/sell
 * @access  Private
 */
export const sellVirtualStock = async (req, res, next) => {
  const { symbol, shares } = req.body;

  try {
    const upperSymbol = symbol.toUpperCase();
    
    const snapshot = await db.collection('portfolios')
      .where('userId', '==', req.user.id)
      .where('symbol', '==', upperSymbol)
      .limit(1)
      .get();

    if (snapshot.empty) {
      res.status(404);
      return next(new Error('Item not found in portfolio'));
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    if (shares >= data.shares) {
      await doc.ref.delete();
    } else {
      await doc.ref.update({
        shares: data.shares - shares
      });
    }

    // Log activity
    await db.collection('activityLogs').add({
      userId: req.user.id,
      action: 'PORTFOLIO_SELL',
      details: `Sold ${shares} shares of ${upperSymbol}`,
      createdAt: new Date().toISOString()
    });

    res.json({ message: 'Sold from portfolio', symbol: upperSymbol });
  } catch (error) {
    res.status(500);
    next(error);
  }
};
