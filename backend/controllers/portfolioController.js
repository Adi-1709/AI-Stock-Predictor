import Portfolio from '../models/Portfolio.js';
import Prediction from '../models/Prediction.js';
import { isDBConnected } from '../config/db.js';
import { sandboxHoldings, sandboxPredictions } from '../config/sandboxData.js';
import { getMarketData } from '../utils/marketHelper.js';

// Helper to fetch/sim current stock price for calculating P&L dynamically
const getCurrentStockPrice = async (symbol) => {
  const upper = symbol.toUpperCase();
  try {
    if (isDBConnected) {
      const latestPred = await Prediction.findOne({ symbol: upper }).sort({ createdAt: -1 });
      if (latestPred && latestPred.actual > 0) {
        return latestPred.actual;
      }
    } else {
      const latestPred = sandboxPredictions.find(p => p.symbol === upper);
      if (latestPred && latestPred.actual > 0) {
        return latestPred.actual;
      }
    }

    // Default price directory fallback if predictions do not exist
    const basePrices = {
      AAPL: 182.63,
      TSLA: 175.34,
      MSFT: 415.50,
      NVDA: 875.12,
      'TCS.NS': 3845.00,
      'RELIANCE.NS': 2920.00,
      'INFY.NS': 1450.50,
      'HDFCBANK.NS': 1580.30
    };
    
    const base = basePrices[upper] || 150.00;
    return parseFloat((base * (0.995 + Math.random() * 0.01)).toFixed(2));
  } catch (err) {
    console.error("Error fetching current price for", symbol, err);
    return 150.00;
  }
};

/**
 * @desc    Get all virtual holdings and compute portfolio statistics
 * @route   GET /api/portfolio
 * @access  Private
 */
export const getPortfolios = async (req, res, next) => {
  const userId = req.user._id || req.user.id || '1';

  try {
    let holdings = [];
    if (isDBConnected) {
      holdings = await Portfolio.find({ user: userId });
      holdings = holdings.map(h => h.toObject ? h.toObject() : h);
    } else {
      holdings = sandboxHoldings.filter(h => h.user.toString() === userId.toString());
    }

    // Compute live values for holdings
    let totalInvested = 0;
    let totalCurrent = 0;

    const enrichedHoldings = await Promise.all(holdings.map(async (h) => {
      const currentPrice = await getCurrentStockPrice(h.symbol);
      const investedValue = h.shares * h.buyPrice;
      const currentValue = h.shares * currentPrice;
      const profitLoss = currentValue - investedValue;
      const percentageReturn = investedValue > 0 ? (profitLoss / investedValue) * 100 : 0;
      
      totalInvested += investedValue;
      totalCurrent += currentValue;

      const marketData = getMarketData(h.symbol, currentPrice);

      return {
        ...h,
        currentPrice,
        investedValue: parseFloat(investedValue.toFixed(2)),
        currentValue: parseFloat(currentValue.toFixed(2)),
        profitLoss: parseFloat(profitLoss.toFixed(2)),
        percentageReturn: parseFloat(percentageReturn.toFixed(2)),
        ...marketData
      };
    }));

    const totalProfitLoss = totalCurrent - totalInvested;
    const totalPercentageReturn = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

    res.json({
      holdings: enrichedHoldings,
      summary: {
        totalInvested: parseFloat(totalInvested.toFixed(2)),
        totalCurrent: parseFloat(totalCurrent.toFixed(2)),
        totalProfitLoss: parseFloat(totalProfitLoss.toFixed(2)),
        totalPercentageReturn: parseFloat(totalPercentageReturn.toFixed(2))
      }
    });

  } catch (error) {
    res.status(500);
    next(error);
  }
};

/**
 * @desc    Buy virtual shares of a stock (Consolidates average price if already owned)
 * @route   POST /api/portfolio/buy
 * @access  Private
 */
export const buyVirtualStock = async (req, res, next) => {
  const userId = req.user._id || req.user.id || '1';
  const { symbol, shares, price } = req.body;

  if (!symbol || !shares || !price || shares <= 0 || price <= 0) {
    return res.status(400).json({ error: 'Valid stock symbol, quantity and purchase price are required' });
  }

  const upperSymbol = symbol.toUpperCase();

  try {
    let holdingRecord;

    if (isDBConnected) {
      holdingRecord = await Portfolio.findOne({ user: userId, symbol: upperSymbol });
      if (holdingRecord) {
        // Average cost blending formula:
        const existingCost = holdingRecord.shares * holdingRecord.buyPrice;
        const newCost = Number(shares) * Number(price);
        holdingRecord.shares += Number(shares);
        holdingRecord.buyPrice = parseFloat(((existingCost + newCost) / holdingRecord.shares).toFixed(2));
        await holdingRecord.save();
      } else {
        holdingRecord = await Portfolio.create({
          user: userId,
          symbol: upperSymbol,
          shares: Number(shares),
          buyPrice: Number(price)
        });
      }
      holdingRecord = holdingRecord.toObject ? holdingRecord.toObject() : holdingRecord;
    } else {
      holdingRecord = sandboxHoldings.find(h => h.user.toString() === userId.toString() && h.symbol === upperSymbol);
      if (holdingRecord) {
        const existingCost = holdingRecord.shares * holdingRecord.buyPrice;
        const newCost = Number(shares) * Number(price);
        holdingRecord.shares += Number(shares);
        holdingRecord.buyPrice = parseFloat(((existingCost + newCost) / holdingRecord.shares).toFixed(2));
      } else {
        holdingRecord = {
          _id: `h-${Date.now()}`,
          user: userId,
          symbol: upperSymbol,
          shares: Number(shares),
          buyPrice: Number(price)
        };
        sandboxHoldings.push(holdingRecord);
      }
    }

    res.json({
      message: `Successfully purchased ${shares} shares of ${upperSymbol} at ${price}`,
      holding: holdingRecord
    });

  } catch (error) {
    res.status(500);
    next(error);
  }
};

/**
 * @desc    Sell virtual shares of a stock
 * @route   POST /api/portfolio/sell
 * @access  Private
 */
export const sellVirtualStock = async (req, res, next) => {
  const userId = req.user._id || req.user.id || '1';
  const { symbol, shares } = req.body;

  if (!symbol || !shares || shares <= 0) {
    return res.status(400).json({ error: 'Valid stock symbol and sell quantity are required' });
  }

  const upperSymbol = symbol.toUpperCase();

  try {
    let holdingRecord;

    if (isDBConnected) {
      holdingRecord = await Portfolio.findOne({ user: userId, symbol: upperSymbol });
    } else {
      holdingRecord = sandboxHoldings.find(h => h.user.toString() === userId.toString() && h.symbol === upperSymbol);
    }

    if (!holdingRecord) {
      return res.status(404).json({ error: `You do not own any shares of ${upperSymbol}` });
    }

    if (holdingRecord.shares < Number(shares)) {
      return res.status(400).json({ error: `Insufficient shares. You only own ${holdingRecord.shares} shares of ${upperSymbol}` });
    }

    // Sell execution
    holdingRecord.shares -= Number(shares);

    if (holdingRecord.shares <= 0) {
      // Delete holding entry
      if (isDBConnected) {
        await Portfolio.deleteOne({ _id: holdingRecord._id });
      } else {
        const idx = sandboxHoldings.findIndex(h => h.user.toString() === userId.toString() && h.symbol === upperSymbol);
        if (idx !== -1) sandboxHoldings.splice(idx, 1);
      }
      
      return res.json({
        message: `Successfully sold all remaining shares of ${upperSymbol}`,
        holding: null
      });
    } else {
      // Save changes
      if (isDBConnected) {
        await holdingRecord.save();
      }
      
      return res.json({
        message: `Successfully sold ${shares} shares of ${upperSymbol}`,
        holding: holdingRecord
      });
    }

  } catch (error) {
    res.status(500);
    next(error);
  }
};
