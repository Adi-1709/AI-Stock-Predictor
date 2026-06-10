/**
 * AI Forecasting & Prediction Service
 * Simulates neural network inference of technical structures, sentiment mapping, and targets.
 */

const REASONINGS = {
  bullish: [
    'Exponential moving average crossover on daily chart suggests robust institutional accumulation. Support holding at historical local consolidation bounds.',
    'Robust demand forecasts and high options volume accumulation above current spot index. Bullish flag breakout verified on high volume.',
    'Positive news sentiment indices coupled with active RSI upward momentum. Near-term resistance levels broken with confidence.'
  ],
  bearish: [
    'Momentum indicators indicate overbought conditions facing profit-taking distribution. Downside pressure expected near upper Bollinger Band bounds.',
    'Sell volume spike observed on intraday charts. MACD negative crossovers across multiple timeframes indicate near-term bearish continuation.',
    'Institutional capital flow index sliding downwards. Headwinds from sector-wide regulatory queries and options straddle closures.'
  ],
  neutral: [
    'Low volume consolidation within tight Bollinger Band ranges. No dominant macro trends detected; expected to hold current support bounds.',
    'Market awaiting key economic index adjustments and interest rate briefings. Sideways price actions predicted in the short term.',
    'Equal distribution of bull and bear options contracts. Technical indicators like RSI hovering near 50-mark standard channels.'
  ]
};

/**
 * Generate synthetic AI prediction metrics for any ticker.
 * @param {string} symbol - Ticker symbol
 * @param {number} currentPrice - Current price of stock
 * @returns {Object} - AI Prediction Object
 */
export const generatePrediction = (symbol, currentPrice) => {
  const directions = ['bullish', 'bearish', 'neutral'];
  const direction = directions[Math.floor(Math.random() * directions.length)];
  
  let targetPrice;
  let recommendation;
  let strength;
  let confidence;
  
  if (direction === 'bullish') {
    const multiplier = 1 + (Math.random() * 0.15 + 0.05); // +5% to +20%
    targetPrice = parseFloat((currentPrice * multiplier).toFixed(2));
    recommendation = Math.random() > 0.4 ? 'Strong Buy' : 'Buy';
    strength = 'High';
    confidence = Math.floor(Math.random() * 25) + 70; // 70% to 95%
  } else if (direction === 'bearish') {
    const multiplier = 1 - (Math.random() * 0.15 + 0.05); // -5% to -20%
    targetPrice = parseFloat((currentPrice * multiplier).toFixed(2));
    recommendation = Math.random() > 0.4 ? 'Strong Sell' : 'Sell';
    strength = 'Moderate';
    confidence = Math.floor(Math.random() * 30) + 60; // 60% to 90%
  } else {
    targetPrice = currentPrice;
    recommendation = 'Hold';
    strength = 'Low';
    confidence = Math.floor(Math.random() * 20) + 45; // 45% to 65%
  }
  
  const reasons = REASONINGS[direction];
  const reasoning = reasons[Math.floor(Math.random() * reasons.length)];
  
  return {
    targetPrice,
    forecastDays: 7,
    confidence,
    direction,
    recommendation,
    strength,
    reasoning
  };
};

/**
 * Generate synthetic technical indicator configurations.
 */
export const generateTechnicals = (direction) => {
  let rsiValue, macdStatus, momentumStatus, volatilityStatus, trendStatus;
  
  if (direction === 'bullish') {
    rsiValue = Math.floor(Math.random() * 15) + 60; // 60-75
    macdStatus = 'Positive Crossover';
    momentumStatus = 'Strong';
    volatilityStatus = 'Medium';
    trendStatus = 'Strong Trend';
  } else if (direction === 'bearish') {
    rsiValue = Math.floor(Math.random() * 15) + 30; // 30-45
    macdStatus = 'Negative Crossover';
    momentumStatus = 'Weak';
    volatilityStatus = 'High';
    trendStatus = 'Weakening Trend';
  } else {
    rsiValue = Math.floor(Math.random() * 20) + 40; // 40-60
    macdStatus = 'Flatline';
    momentumStatus = 'Moderate';
    volatilityStatus = 'Low';
    trendStatus = 'Consolidating';
  }
  
  return {
    rsi: { value: rsiValue, status: rsiValue > 65 ? 'Overbought' : rsiValue < 35 ? 'Oversold' : 'Neutral', progress: rsiValue, color: rsiValue > 65 ? 'text-neon-rose' : rsiValue < 35 ? 'text-neon-emerald' : 'text-amber-450' },
    macd: { value: direction === 'bullish' ? 1.5 : direction === 'bearish' ? -1.5 : 0.05, status: macdStatus, progress: 75, color: direction === 'bullish' ? 'text-neon-emerald' : direction === 'bearish' ? 'text-neon-rose' : 'text-amber-450' },
    momentum: { value: direction === 'bullish' ? 12.4 : direction === 'bearish' ? -8.2 : 0.5, status: momentumStatus, progress: 60, color: direction === 'bullish' ? 'text-neon-emerald' : direction === 'bearish' ? 'text-neon-rose' : 'text-neon-cyan' },
    volatility: { value: volatilityStatus === 'High' ? 35 : 15, status: volatilityStatus, progress: 40, color: 'text-neon-cyan' },
    adx: { value: direction === 'neutral' ? 12 : 28, status: trendStatus, progress: 65, color: 'text-neon-emerald' },
    obv: { value: 75, status: direction === 'bullish' ? 'Accumulation' : 'Distribution', progress: 75, color: 'text-neon-emerald' }
  };
};
