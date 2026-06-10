import Watchlist from '../models/Watchlist.js';
import Prediction from '../models/Prediction.js';
import ActivityLog from '../models/ActivityLog.js';
import { isDBConnected } from '../config/db.js';
import { sandboxWatchlists, sandboxPredictions, sandboxActivityLogs } from '../config/sandboxData.js';
import { getMarketData } from '../utils/marketHelper.js';

/**
 * @desc    Get current user watchlist items with market data
 * @route   GET /api/watchlist
 * @access  Private
 */
export const getWatchlist = async (req, res, next) => {
  try {
    let symbols;
    const userIdStr = String(req.user._id || req.user.id);

    if (isDBConnected) {
      const watchlistItems = await Watchlist.find({ user: req.user._id });
      symbols = watchlistItems.map(item => item.symbol);
    } else {
      const items = sandboxWatchlists.filter(w => String(w.user) === userIdStr);
      symbols = items.map(item => item.symbol);
    }
    
    // Resolve full stock details for each symbol in watchlist
    const watchlistDetails = [];
    for (const symbol of symbols) {
      let latestPred;
      if (isDBConnected) {
        latestPred = await Prediction.findOne({ symbol }).sort({ createdAt: -1 });
      } else {
        latestPred = sandboxPredictions
          .filter(p => p.symbol === symbol)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
      }
      
      const priceVal = latestPred ? (latestPred.actual || latestPred.targetPrice / (1.1)) : (
        symbol.toUpperCase().includes('TCS') ? 3845.00 :
        symbol.toUpperCase().includes('RELIANCE') ? 2920.00 :
        symbol.toUpperCase().includes('INFY') ? 1450.50 :
        symbol.toUpperCase().includes('HDFCBANK') ? 1580.30 : 150.00
      );
      const marketData = getMarketData(symbol, priceVal);

      if (latestPred) {
        watchlistDetails.push({
          symbol: latestPred.symbol,
          name: symbol.toUpperCase().includes('RELIANCE') ? 'Reliance Industries Ltd.' :
                symbol.toUpperCase().includes('TCS') ? 'Tata Consultancy Services' :
                symbol.toUpperCase().includes('INFY') ? 'Infosys Ltd.' :
                symbol.toUpperCase().includes('HDFCBANK') ? 'HDFC Bank Ltd.' :
                `${latestPred.symbol} Corp.`,
          price: priceVal,
          change: parseFloat((Math.random() * 6 - 3).toFixed(2)),
          changePercent: parseFloat((Math.random() * 3 - 1.5).toFixed(2)),
          aiPrediction: {
            recommendation: latestPred.recommendation,
            confidence: latestPred.confidence,
            direction: latestPred.direction
          },
          ...marketData
        });
      } else {
        watchlistDetails.push({
          symbol,
          name: symbol.toUpperCase().includes('RELIANCE') ? 'Reliance Industries Ltd.' :
                symbol.toUpperCase().includes('TCS') ? 'Tata Consultancy Services' :
                symbol.toUpperCase().includes('INFY') ? 'Infosys Ltd.' :
                symbol.toUpperCase().includes('HDFCBANK') ? 'HDFC Bank Ltd.' :
                `${symbol} Corp.`,
          price: priceVal,
          change: 0.0,
          changePercent: 0.0,
          aiPrediction: { recommendation: 'Hold', confidence: 50, direction: 'neutral' },
          ...marketData
        });
      }
    }
    
    res.json(watchlistDetails);
  } catch (error) {
    res.status(500);
    next(error);
  }
};

/**
 * @desc    Add symbol to user watchlist
 * @route   POST /api/watchlist
 * @access  Private
 */
export const addWatchlistItem = async (req, res, next) => {
  const { symbol } = req.body;
  
  if (!symbol) {
    res.status(400);
    return next(new Error('Please provide stock ticker symbol'));
  }

  const upperSymbol = symbol.toUpperCase();
  const userIdStr = String(req.user._id || req.user.id);

  try {
    if (isDBConnected) {
      await Watchlist.findOneAndUpdate(
        { user: req.user._id, symbol: upperSymbol },
        { user: req.user._id, symbol: upperSymbol },
        { upsert: true, new: true }
      );
    } else {
      const exists = sandboxWatchlists.some(w => String(w.user) === userIdStr && w.symbol === upperSymbol);
      if (!exists) {
        sandboxWatchlists.push({
          _id: `w-${Date.now()}`,
          user: userIdStr,
          symbol: upperSymbol
        });
      }
    }

    // Fetch updated watchlist list
    let watchlistSymbols;
    if (isDBConnected) {
      const items = await Watchlist.find({ user: req.user._id });
      watchlistSymbols = items.map(i => i.symbol);
    } else {
      const items = sandboxWatchlists.filter(w => String(w.user) === userIdStr);
      watchlistSymbols = items.map(i => i.symbol);
    }

    // Record activity log event
    const logDetails = {
      user: req.user._id || req.user.id,
      action: 'ADD_WATCHLIST',
      details: `Added symbol to watchlist: ${upperSymbol}`,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || '',
      createdAt: new Date()
    };

    if (isDBConnected) {
      await ActivityLog.create(logDetails);
    } else {
      sandboxActivityLogs.unshift(logDetails);
    }

    res.json({
      message: 'Ticker added to watchlist successfully',
      watchlist: watchlistSymbols
    });
  } catch (error) {
    res.status(500);
    next(error);
  }
};

/**
 * @desc    Remove symbol from user watchlist
 * @route   DELETE /api/watchlist/:symbol
 * @access  Private
 */
export const removeWatchlistItem = async (req, res, next) => {
  const { symbol } = req.params;
  const upperSymbol = symbol.toUpperCase();
  const userIdStr = String(req.user._id || req.user.id);

  try {
    if (isDBConnected) {
      await Watchlist.deleteOne({ user: req.user._id, symbol: upperSymbol });
    } else {
      const idx = sandboxWatchlists.findIndex(w => String(w.user) === userIdStr && w.symbol === upperSymbol);
      if (idx !== -1) {
        sandboxWatchlists.splice(idx, 1);
      }
    }

    // Fetch updated watchlist list
    let watchlistSymbols;
    if (isDBConnected) {
      const items = await Watchlist.find({ user: req.user._id });
      watchlistSymbols = items.map(i => i.symbol);
    } else {
      const items = sandboxWatchlists.filter(w => String(w.user) === userIdStr);
      watchlistSymbols = items.map(i => i.symbol);
    }

    // Record activity log event
    const logDetails = {
      user: req.user._id || req.user.id,
      action: 'REMOVE_WATCHLIST',
      details: `Removed symbol from watchlist: ${upperSymbol}`,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || '',
      createdAt: new Date()
    };

    if (isDBConnected) {
      await ActivityLog.create(logDetails);
    } else {
      sandboxActivityLogs.unshift(logDetails);
    }

    res.json({
      message: 'Ticker removed from watchlist successfully',
      watchlist: watchlistSymbols
    });
  } catch (error) {
    res.status(500);
    next(error);
  }
};
