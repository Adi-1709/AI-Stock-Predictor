// Mock market data since this is primarily for demonstration purposes
const mockIndices = [
  { symbol: 'SPY', name: 'S&P 500', value: 5120.30, change: 45.20, changePercent: 0.89, direction: 'up' },
  { symbol: 'QQQ', name: 'Nasdaq 100', value: 4380.15, change: 52.80, changePercent: 1.22, direction: 'up' },
  { symbol: 'DIA', name: 'Dow Jones', value: 38950.40, change: -120.30, changePercent: -0.31, direction: 'down' },
  { symbol: 'IWM', name: 'Russell 2000', value: 2050.80, change: 15.40, changePercent: 0.76, direction: 'up' }
];

const mockMovers = {
  gainers: [
    { symbol: 'NVDA', name: 'NVIDIA Corp', price: 884.80, changePercent: 4.5 },
    { symbol: 'AMD', name: 'Advanced Micro', price: 178.20, changePercent: 3.8 }
  ],
  losers: [
    { symbol: 'TSLA', name: 'Tesla Inc', price: 175.34, changePercent: -2.4 },
    { symbol: 'BA', name: 'Boeing Co', price: 185.20, changePercent: -1.8 }
  ]
};

/**
 * @desc    Get live indices baseline
 * @route   GET /api/market/indices
 * @access  Public
 */
export const getIndices = async (req, res, next) => {
  try {
    res.json(initialIndices);
  } catch (error) {
    res.status(500);
    next(error);
  }
};

/**
 * @desc    Get top gainers & losers for Indian & US Markets
 * @route   GET /api/market/movers
 * @access  Public
 */
export const getMovers = async (req, res, next) => {
  try {
    const movers = {
      india: {
        gainers: [
          { ticker: 'RELIANCE.NS', company: 'Reliance Industries Ltd.', price: 2950.40, changePercent: 2.45, change: 70.60, market: 'NSE' },
          { ticker: 'TCS.NS', company: 'Tata Consultancy Services Ltd.', price: 3890.15, changePercent: 1.85, change: 70.75, market: 'NSE' },
          { ticker: 'INFY.NS', company: 'Infosys Limited', price: 1475.60, changePercent: 1.62, change: 23.50, market: 'NSE' },
          { ticker: 'HDFCBANK.NS', company: 'HDFC Bank Limited', price: 1590.20, changePercent: 1.34, change: 21.00, market: 'NSE' }
        ],
        losers: [
          { ticker: 'AXISBANK.NS', company: 'Axis Bank Limited', price: 1045.00, changePercent: -2.15, change: -23.00, market: 'NSE' },
          { ticker: 'ICICIBANK.NS', company: 'ICICI Bank Limited', price: 1110.40, changePercent: -1.75, change: -19.80, market: 'NSE' },
          { ticker: 'SBIN.NS', company: 'State Bank of India', price: 780.20, changePercent: -1.25, change: -9.85, market: 'NSE' }
        ]
      },
      usa: {
        gainers: [
          { ticker: 'NVDA', company: 'NVIDIA Corporation', price: 895.20, changePercent: 4.85, change: 41.38, market: 'NASDAQ' },
          { ticker: 'AAPL', company: 'Apple Inc.', price: 185.40, changePercent: 2.10, change: 3.81, market: 'NASDAQ' },
          { ticker: 'MSFT', company: 'Microsoft Corporation', price: 421.30, changePercent: 1.78, change: 7.37, market: 'NASDAQ' }
        ],
        losers: [
          { ticker: 'TSLA', company: 'Tesla Inc.', price: 172.10, changePercent: -3.40, change: -6.06, market: 'NASDAQ' },
          { ticker: 'NFLX', company: 'Netflix Inc.', price: 610.50, changePercent: -1.90, change: -11.82, market: 'NASDAQ' },
          { ticker: 'AMZN', company: 'Amazon.com Inc.', price: 178.40, changePercent: -1.20, change: -2.17, market: 'NASDAQ' }
        ]
      }
    };
    res.json(movers);
  } catch (error) {
    res.status(500);
    next(error);
  }
};

/**
 * @desc    Get trending stocks with sentiment & indicators
 * @route   GET /api/market/trending
 * @access  Public
 */
export const getTrending = async (req, res, next) => {
  try {
    const trending = {
      india: [
        { ticker: 'RELIANCE.NS', name: 'Reliance Industries', trendBadge: 'High Volume', bullishScore: 85, confidenceScore: 82, price: 2950.40, changePercent: 2.45 },
        { ticker: 'TCS.NS', name: 'Tata Consultancy Services', trendBadge: 'Breakout', bullishScore: 78, confidenceScore: 76, price: 3890.15, changePercent: 1.85 },
        { ticker: 'INFY.NS', name: 'Infosys Limited', trendBadge: 'Social Spike', bullishScore: 72, confidenceScore: 68, price: 1475.60, changePercent: 1.62 },
        { ticker: 'HDFCBANK.NS', name: 'HDFC Bank Limited', trendBadge: 'Steady Flow', bullishScore: 65, confidenceScore: 62, price: 1590.20, changePercent: 1.34 }
      ],
      usa: [
        { ticker: 'AAPL', name: 'Apple Inc.', trendBadge: 'AI Upgrade', bullishScore: 82, confidenceScore: 74, price: 185.40, changePercent: 2.10 },
        { ticker: 'TSLA', name: 'Tesla Inc.', trendBadge: 'Earnings Swing', bullishScore: 48, confidenceScore: 52, price: 172.10, changePercent: -3.40 },
        { ticker: 'NVDA', name: 'NVIDIA Corporation', trendBadge: 'GPU Demand', bullishScore: 94, confidenceScore: 91, price: 895.20, changePercent: 4.85 },
        { ticker: 'MSFT', name: 'Microsoft Corporation', trendBadge: 'Cloud Push', bullishScore: 88, confidenceScore: 85, price: 421.30, changePercent: 1.78 }
      ]
    };
    res.json(trending);
  } catch (error) {
    res.status(500);
    next(error);
  }
};

/**
 * @desc    Get AI Daily Market Summary
 * @route   GET /api/market/summary
 * @access  Public
 */
export const getSummary = async (req, res, next) => {
  try {
    const summaryData = {
      summary: "Indian markets remained moderately bullish today as IT and heavyweight sectors showed strength. Reliance and TCS gained momentum due to positive technical indicators, pushing the Nifty index higher. Meanwhile, US tech stocks continued their bullish run, driven by NVIDIA's massive gains and Apple's AI processor upgrades, offsetting minor pullbacks in Tesla due to supply chain logistics adjustments.",
      sentiment: "Moderately Positive",
      color: "emerald"
    };
    res.json(summaryData);
  } catch (error) {
    res.status(500);
    next(error);
  }
};
