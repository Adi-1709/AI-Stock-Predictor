import { db } from '../config/firebase.js';
import yahooFinance2 from 'yahoo-finance2';
import axios from 'axios';

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

const getLogSymbol = (log) => {
  if (log.symbol && log.symbol !== '$' && log.symbol !== '₹') return log.symbol;
  return log.ticker || 'AAPL';
};

/**
 * @desc    Get prediction history logs with pagination & filtering
 * @route   GET /api/history
 * @access  Private
 */
export const getHistory = async (req, res, next) => {
  try {
    const { 
      searchTerm = '', 
      filterType = 'all', 
      sortKey = 'date', 
      sortDir = 'desc', 
      page = 1, 
      limit = 6 
    } = req.query;

    const limitNum = parseInt(limit, 10) || 6;
    const pageNum = parseInt(page, 10) || 1;

    let query = db.collection('predictions');

    if (filterType !== 'all') {
      query = query.where('prediction', '==', filterType.toUpperCase());
    }

    const snapshot = await query.get();
    
    let logs = [];
    snapshot.forEach(doc => {
      logs.push({ _id: doc.id, ...doc.data() });
    });

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      logs = logs.filter(log => {
        const sym = getLogSymbol(log);
        return sym && sym.toLowerCase().includes(term);
      });
    }

    logs.sort((a, b) => {
      let valA = a[sortKey] || '';
      let valB = b[sortKey] || '';

      if (sortKey === 'confidence') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      } else if (sortKey === 'date' || sortKey === 'createdAt') {
        valA = new Date(valA).getTime() || 0;
        valB = new Date(valB).getTime() || 0;
      }

      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    const total = logs.length;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedLogs = logs.slice(startIndex, startIndex + limitNum);

    // REAL TIME VERIFICATION
    const uniqueSymbols = [...new Set(paginatedLogs.map(getLogSymbol))];
    const currentPrices = {};
    const flaskUrl = process.env.FLASK_ML_URL;

    for (const sym of uniqueSymbols) {
      try {
        if (flaskUrl) {
          try {
            const flaskRes = await axios.get(`${flaskUrl}/predict/${sym}`, { timeout: 3000 });
            if (flaskRes.data && flaskRes.data.price) {
              currentPrices[sym] = flaskRes.data.price;
              continue;
            }
          } catch (flaskErr) {
            // ignore
          }
        }
        const quote = await yahooFinance.quote(sym);
        currentPrices[sym] = quote.regularMarketPrice;
      } catch (err) {
        currentPrices[sym] = getMockPrice(sym);
      }
    }

    const verifiedLogs = paginatedLogs.map(log => {
      let status = 'Pending';
      const logSym = getLogSymbol(log);
      const curPrice = currentPrices[logSym];
      const initialPrice = log.currentPrice || log.actual || getMockPrice(logSym);
      if (curPrice && initialPrice && log.prediction) {
        if (log.prediction === 'BUY' && curPrice > initialPrice) status = 'Complied';
        else if (log.prediction === 'SELL' && curPrice < initialPrice) status = 'Complied';
        else if (log.prediction === 'HOLD' && Math.abs(curPrice - initialPrice)/initialPrice < 0.02) status = 'Complied';
        else status = 'Failed';
      }
      return { ...log, symbol: logSym, status, actual: curPrice || initialPrice || 0 };
    });

    res.json({
      logs: verifiedLogs,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    res.status(500);
    next(error);
  }
};

/**
 * @desc    Get prediction stats
 * @route   GET /api/history/stats
 * @access  Private
 */
export const getStats = async (req, res, next) => {
  try {
    const snapshot = await db.collection('predictions').get();
    let logs = [];
    snapshot.forEach(doc => logs.push(doc.data()));

    const uniqueSymbols = [...new Set(logs.map(getLogSymbol))];
    const currentPrices = {};
    const flaskUrl = process.env.FLASK_ML_URL;

    // Fetch quotes in parallel to speed it up, limit to unique symbols
    await Promise.all(uniqueSymbols.map(async (sym) => {
      try {
        if (flaskUrl) {
          try {
            const flaskRes = await axios.get(`${flaskUrl}/predict/${sym}`, { timeout: 3000 });
            if (flaskRes.data && flaskRes.data.price) {
              currentPrices[sym] = flaskRes.data.price;
              return;
            }
          } catch (flaskErr) {
            // ignore
          }
        }
        const quote = await yahooFinance.quote(sym);
        currentPrices[sym] = quote.regularMarketPrice;
      } catch (err) {
        currentPrices[sym] = getMockPrice(sym);
      }
    }));

    let total = logs.length;
    let compliedCount = 0;
    const assetStats = {};

    logs.forEach(log => {
      let status = 'Failed';
      const logSym = getLogSymbol(log);
      const curPrice = currentPrices[logSym];
      const initialPrice = log.currentPrice || log.actual || getMockPrice(logSym);
      if (curPrice && initialPrice && log.prediction) {
        if (log.prediction === 'BUY' && curPrice > initialPrice) status = 'Complied';
        else if (log.prediction === 'SELL' && curPrice < initialPrice) status = 'Complied';
        else if (log.prediction === 'HOLD' && Math.abs(curPrice - initialPrice)/initialPrice < 0.02) status = 'Complied';
      }
      
      if (status === 'Complied') compliedCount++;

      const sym = logSym;
      if (sym) {
        if (!assetStats[sym]) assetStats[sym] = { total: 0, wins: 0 };
        assetStats[sym].total += 1;
        if (status === 'Complied') assetStats[sym].wins += 1;
      }
    });

    const accuracy = total > 0 ? ((compliedCount / total) * 100).toFixed(1) : '0.0';

    let bestAsset = 'N/A';
    let bestRate = -1;
    Object.entries(assetStats).forEach(([symbol, data]) => {
      const rate = data.wins / data.total;
      if (rate > bestRate) {
        bestRate = rate;
        bestAsset = symbol;
      }
    });

    res.json({
      total: `${total} Validated Cycles`,
      accuracy: `${accuracy}%`,
      bestStock: bestAsset !== 'N/A' ? `${bestAsset} (${(bestRate * 100).toFixed(0)}% Win)` : 'N/A',
      successRate: `${compliedCount} Wins / ${total - compliedCount} Losses`
    });
  } catch (error) {
    res.status(500);
    next(error);
  }
};

/**
 * @desc    Create a new prediction history log
 * @route   POST /api/history
 * @access  Private
 */
export const createHistoryLog = async (req, res, next) => {
  try {
    const newLog = {
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    const docRef = await db.collection('predictions').add(newLog);
    res.status(201).json({ _id: docRef.id, ...newLog });
  } catch (error) {
    res.status(500);
    next(error);
  }
};
