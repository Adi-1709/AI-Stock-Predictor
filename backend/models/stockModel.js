// Mock Stock Database matching the frontend schema
const mockStockDatabase = {
  AAPL: {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 182.63,
    change: 2.41,
    changePercent: 1.34,
    high: 183.92,
    low: 180.88,
    open: 181.10,
    volume: 52430000,
    marketCap: 2850000000000,
    peRatio: 29.4,
    dividendYield: 0.53,
    aiPrediction: {
      targetPrice: 198.50,
      forecastDays: 7,
      confidence: 74,
      direction: 'bullish', // bullish, bearish, neutral
      recommendation: 'Strong Buy',
      strength: 'High',
      reasoning: 'Strong iPhone sales forecasts in Asia coupled with aggressive AI chip design expansion plans. Supported by double-bottom breakout on 4-hour chart.'
    },
    technicals: {
      rsi: { value: 68, status: 'Bullish', progress: 68, color: 'text-neon-emerald' },
      macd: { value: 1.45, status: 'Positive Crossover', progress: 85, color: 'text-neon-emerald' },
      momentum: { value: 12.4, status: 'Strong', progress: 78, color: 'text-neon-emerald' },
      volatility: { value: 18, status: 'Medium', progress: 45, color: 'text-neon-cyan' },
      adx: { value: 28, status: 'Strong Trend', progress: 70, color: 'text-neon-emerald' },
      obv: { value: 89, status: 'Positive Flow', progress: 89, color: 'text-neon-emerald' }
    },
    sentiment: {
      positive: 68,
      negative: 22,
      neutral: 10,
      explanation: 'Consensus upgrade from multiple tier-1 institutions. High retail buying volume following consumer intelligence leaks.'
    },
    chartData: {
      '1D': [
        { date: '09:30', price: 181.10, open: 181.10, high: 181.50, low: 180.90, close: 181.40 },
        { date: '11:00', price: 181.40, open: 181.40, high: 182.20, low: 181.10, close: 182.00 },
        { date: '13:00', price: 182.00, open: 182.00, high: 182.50, low: 181.80, close: 182.10 },
        { date: '15:00', price: 182.10, open: 182.10, high: 183.12, low: 182.00, close: 182.90 },
        { date: '16:00', price: 182.63, open: 182.90, high: 183.92, low: 182.50, close: 182.63 }
      ],
      '1W': [
        { date: 'Mon', price: 178.50, open: 177.0, high: 179.2, low: 176.5, close: 178.50 },
        { date: 'Tue', price: 179.80, open: 178.5, high: 180.4, low: 178.0, close: 179.80 },
        { date: 'Wed', price: 178.20, open: 179.8, high: 180.1, low: 177.6, close: 178.20 },
        { date: 'Thu', price: 180.90, open: 178.2, high: 181.3, low: 178.1, close: 180.90 },
        { date: 'Fri', price: 182.63, open: 180.9, high: 183.9, low: 180.8, close: 182.63 }
      ]
    }
  },
  TSLA: {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    price: 175.34,
    change: 0.12,
    changePercent: 0.07,
    high: 178.45,
    low: 173.10,
    open: 174.50,
    volume: 85200000,
    marketCap: 558000000000,
    peRatio: 42.8,
    dividendYield: 0.00,
    aiPrediction: {
      targetPrice: 176.00,
      forecastDays: 7,
      confidence: 52,
      direction: 'neutral',
      recommendation: 'Hold',
      strength: 'Low',
      reasoning: 'Regulatory credits offset supply chain delivery bottlenecks in Europe. Price actions indicate standard base building range with low volume.'
    },
    technicals: {
      rsi: { value: 49, status: 'Neutral', progress: 49, color: 'text-amber-450' },
      macd: { value: -0.12, status: 'Flatline', progress: 50, color: 'text-amber-450' },
      momentum: { value: 1.1, status: 'Weak', progress: 32, color: 'text-neon-rose' },
      volatility: { value: 38, status: 'High', progress: 75, color: 'text-neon-rose' },
      adx: { value: 14, status: 'Weak Trend', progress: 30, color: 'text-amber-450' },
      obv: { value: 42, status: 'Flat Flow', progress: 42, color: 'text-amber-450' }
    },
    sentiment: {
      positive: 40,
      negative: 42,
      neutral: 18,
      explanation: 'Headwinds from retail supply checks and CEO compensation votes. Options volumes indicate significant straddle positions.'
    },
    chartData: {
      '1D': [
        { date: '09:30', price: 174.50, open: 174.50, high: 176.00, low: 173.50, close: 175.00 },
        { date: '11:00', price: 175.00, open: 175.00, high: 177.20, low: 174.10, close: 176.10 },
        { date: '13:00', price: 176.10, open: 176.10, high: 176.80, low: 175.00, close: 175.20 },
        { date: '15:00', price: 175.20, open: 175.20, high: 178.45, low: 173.10, close: 174.90 },
        { date: '16:00', price: 175.34, open: 174.90, high: 178.45, low: 173.10, close: 175.34 }
      ]
    }
  },
  MSFT: {
    symbol: 'MSFT',
    name: 'Microsoft Corp.',
    price: 415.50,
    change: 4.88,
    changePercent: 1.19,
    high: 417.20,
    low: 410.50,
    open: 411.00,
    volume: 22100000,
    marketCap: 3090000000000,
    peRatio: 36.2,
    dividendYield: 0.72,
    aiPrediction: {
      targetPrice: 435.00,
      forecastDays: 7,
      confidence: 91,
      direction: 'bullish',
      recommendation: 'Strong Buy',
      strength: 'High',
      reasoning: 'Azure Copilot growth vector accelerates. Expansion of cloud licensing contracts across Fortune 500 triggers positive consensus upgrades.'
    },
    technicals: {
      rsi: { value: 72, status: 'Overbought', progress: 72, color: 'text-neon-emerald' },
      macd: { value: 2.80, status: 'Positive Cross', progress: 92, color: 'text-neon-emerald' },
      momentum: { value: 14.8, status: 'Strong', progress: 88, color: 'text-neon-emerald' },
      volatility: { value: 14, status: 'Low', progress: 28, color: 'text-neon-cyan' },
      adx: { value: 36, status: 'Strong Trend', progress: 84, color: 'text-neon-emerald' },
      obv: { value: 94, status: 'Accumulation', progress: 94, color: 'text-neon-emerald' }
    },
    sentiment: {
      positive: 78,
      negative: 12,
      neutral: 10,
      explanation: 'Outstanding cloud licensing consensus updates. Strong developer acquisition metrics across core visual platforms.'
    }
  },
  NVDA: {
    symbol: 'NVDA',
    name: 'NVIDIA Corp.',
    price: 875.12,
    change: 22.45,
    changePercent: 2.63,
    high: 884.80,
    low: 850.10,
    open: 852.00,
    volume: 41200000,
    marketCap: 2190000000000,
    peRatio: 74.3,
    dividendYield: 0.02,
    aiPrediction: {
      targetPrice: 940.00,
      forecastDays: 7,
      confidence: 94,
      direction: 'bullish',
      recommendation: 'Strong Buy',
      strength: 'High',
      reasoning: 'Next-gen Blackwell server configurations outperforming early benchmarks. Supply chains indicate strong backlog and pricing power.'
    },
    technicals: {
      rsi: { value: 78, status: 'Overbought', progress: 78, color: 'text-neon-rose' },
      macd: { value: 4.90, status: 'Strong Trend', progress: 96, color: 'text-neon-emerald' },
      momentum: { value: 24.2, status: 'Extremely Strong', progress: 95, color: 'text-neon-emerald' },
      volatility: { value: 29, status: 'Medium', progress: 68, color: 'text-neon-cyan' },
      adx: { value: 45, status: 'Violent Trend', progress: 90, color: 'text-neon-emerald' },
      obv: { value: 96, status: 'Accumulation', progress: 96, color: 'text-neon-emerald' }
    },
    sentiment: {
      positive: 85,
      negative: 8,
      neutral: 7,
      explanation: 'Chip shipments backlog extends through late 2026. Developer integration reports confirm Blackwell pricing margins exceed targets.'
    }
  },
  TCS: {
    symbol: 'TCS',
    name: 'Tata Consultancy Services',
    price: 3845.00,
    change: 45.20,
    changePercent: 1.19,
    high: 3890.00,
    low: 3810.00,
    open: 3815.00,
    volume: 1250000,
    marketCap: 140800000000,
    peRatio: 28.2,
    dividendYield: 1.18,
    aiPrediction: {
      targetPrice: 4080.00,
      forecastDays: 7,
      confidence: 76,
      direction: 'bullish',
      recommendation: 'Buy',
      strength: 'Moderate',
      reasoning: 'Steady client accretion in digital cloud solutions along with banking sector contracts renewal. Support holding at 200-day exponential moving average.'
    },
    technicals: {
      rsi: { value: 62, status: 'Bullish', progress: 62, color: 'text-neon-emerald' },
      macd: { value: 12.4, status: 'Positive Cross', progress: 74, color: 'text-neon-emerald' },
      momentum: { value: 6.8, status: 'Moderate', progress: 60, color: 'text-neon-cyan' },
      volatility: { value: 12, status: 'Low', progress: 24, color: 'text-neon-cyan' },
      adx: { value: 24, status: 'Healthy Trend', progress: 60, color: 'text-neon-emerald' },
      obv: { value: 72, status: 'Positive Flow', progress: 72, color: 'text-neon-emerald' }
    },
    sentiment: {
      positive: 65,
      negative: 20,
      neutral: 15,
      explanation: 'Healthy pipeline orders matching domestic consensus forecasts. Neutral volatility markers suggest stable upward movement.'
    }
  },
  RELIANCE: {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd.',
    price: 2920.00,
    change: -18.40,
    changePercent: -0.63,
    high: 2950.00,
    low: 2905.00,
    open: 2942.00,
    volume: 3200000,
    marketCap: 198000000000,
    peRatio: 26.8,
    dividendYield: 0.34,
    aiPrediction: {
      targetPrice: 2880.00,
      forecastDays: 7,
      confidence: 64,
      direction: 'bearish',
      recommendation: 'Sell',
      strength: 'Moderate',
      reasoning: 'Brief compression margins on refining cycles coupled with increased capital outlays for telecom infrastructure expansions. Support at 50-day average.'
    },
    technicals: {
      rsi: { value: 41, status: 'Bearish Bias', progress: 41, color: 'text-neon-rose' },
      macd: { value: -2.10, status: 'Negative Cross', progress: 38, color: 'text-neon-rose' },
      momentum: { value: -4.2, status: 'Weak', progress: 28, color: 'text-neon-rose' },
      volatility: { value: 16, status: 'Low', progress: 32, color: 'text-neon-cyan' },
      adx: { value: 20, status: 'Weak Trend', progress: 45, color: 'text-amber-450' },
      obv: { value: 38, status: 'Distribution', progress: 38, color: 'text-neon-rose' }
    },
    sentiment: {
      positive: 35,
      negative: 55,
      neutral: 10,
      explanation: 'Refined margin cuts pressuring local brokers. Distribution blocks indicate institutional offloading ahead of quarterly audits.'
    }
  }
};

/**
 * Retrieve all stock items with summaries.
 */
export const getAllStocks = async () => {
  return Object.values(mockStockDatabase).map(stock => ({
    symbol: stock.symbol,
    name: stock.name,
    price: stock.price,
    change: stock.change,
    changePercent: stock.changePercent,
    aiPrediction: stock.aiPrediction
  }));
};

/**
 * Find specific stock by ticker symbol.
 */
export const getStockDetail = async (symbol) => {
  const upperSymbol = symbol.toUpperCase();
  const stock = mockStockDatabase[upperSymbol];
  if (!stock) return null;
  
  // Generate mock chart data dynamically if missing to keep files light
  if (!stock.chartData) {
    stock.chartData = generateMockChartData(stock.price);
  }
  
  return stock;
};

/**
 * Update stock prices to simulate a live market environment.
 */
export const updateLiveStockPrices = () => {
  Object.keys(mockStockDatabase).forEach(symbol => {
    const stock = mockStockDatabase[symbol];
    const fluctuationPercent = (Math.random() * 2 - 1) * 0.005; // Max 0.5% shift
    const priceShift = stock.price * fluctuationPercent;
    
    stock.price = parseFloat((stock.price + priceShift).toFixed(2));
    stock.change = parseFloat((stock.change + priceShift).toFixed(2));
    stock.changePercent = parseFloat(((stock.change / (stock.price - stock.change)) * 100).toFixed(2));
    
    if (stock.price > stock.high) stock.high = stock.price;
    if (stock.price < stock.low) stock.low = stock.price;
  });
};

// Periodic price updates simulation
setInterval(updateLiveStockPrices, 30000); // every 30s

/**
 * Generate synthetic chart points.
 */
function generateMockChartData(basePrice) {
  const timeframes = ['1D', '1W', '1M', '6M', '1Y'];
  const data = {};
  
  timeframes.forEach(tf => {
    let points = 5;
    if (tf === '1D') points = 6;
    if (tf === '1W') points = 7;
    
    const arr = [];
    let currPrice = basePrice * (1 - (Math.random() * 0.04));
    
    for (let i = 0; i < points; i++) {
      const step = basePrice * (Math.random() * 0.02);
      currPrice += step;
      arr.push({
        date: `T${i + 1}`,
        price: parseFloat(currPrice.toFixed(2)),
        open: parseFloat((currPrice - (step * 0.4)).toFixed(2)),
        high: parseFloat((currPrice + (step * 0.2)).toFixed(2)),
        low: parseFloat((currPrice - (step * 0.6)).toFixed(2)),
        close: parseFloat(currPrice.toFixed(2))
      });
    }
    
    // Ensure final element matches current price exactly
    arr[arr.length - 1].price = basePrice;
    arr[arr.length - 1].close = basePrice;
    
    data[tf] = arr;
  });
  
  return data;
}
