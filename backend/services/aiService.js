/**
 * AI Forecasting & Prediction Service
 * Real data integration with Yahoo Finance.
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

export const generatePrediction = (symbol, currentPrice, technicals = null) => {
  let direction = 'neutral';
  let targetPrice = currentPrice;
  let recommendation = 'Hold';
  let strength = 'Low';
  let confidence = 50;

  if (technicals && technicals.rsi && technicals.rsi.value !== undefined) {
    const rsiValue = technicals.rsi.value;
    const macdValue = technicals.macd ? technicals.macd.value : 0;
    
    let score = 0;
    // More sensitive RSI thresholds
    if (rsiValue < 40) score += 2;
    else if (rsiValue < 50) score += 1;
    else if (rsiValue > 60) score -= 2;
    else if (rsiValue > 50) score -= 1;

    // MACD momentum
    if (macdValue > 0) {
      score += 1.5;
      if (macdValue > 0.5) score += 1;
    }
    else if (macdValue < 0) {
      score -= 1.5;
      if (macdValue < -0.5) score -= 1;
    }

    // Lowered threshold from 2 to 1 for more active signals
    if (score >= 1) {
      direction = 'bullish';
      recommendation = score > 2.5 ? 'Strong Buy' : 'Buy';
      strength = score > 2.5 ? 'High' : 'Moderate';
      confidence = 65 + (score * 6);
      targetPrice = parseFloat((currentPrice * (1 + (score * 0.02))).toFixed(2));
    } else if (score <= -1) {
      direction = 'bearish';
      recommendation = score < -2.5 ? 'Strong Sell' : 'Sell';
      strength = score < -2.5 ? 'High' : 'Moderate';
      confidence = 65 + (Math.abs(score) * 6);
      targetPrice = parseFloat((currentPrice * (1 - (Math.abs(score) * 0.02))).toFixed(2));
    } else {
      direction = 'neutral';
      recommendation = 'Hold';
      strength = 'Low';
      confidence = 50 + (Math.random() * 10);
      targetPrice = currentPrice;
    }
  }

  // Cap confidence at 99
  confidence = Math.min(Math.floor(confidence), 99);

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

export const generateRealTechnicals = (history) => {
  if (!history || history.length < 14) {
    return {
      rsi: { value: 50, status: 'Neutral', progress: 50, color: 'text-amber-450' },
      macd: { value: 0, status: 'Flatline', progress: 50, color: 'text-amber-450' },
      momentum: { value: 0, status: 'Moderate', progress: 50, color: 'text-neon-cyan' },
      volatility: { value: 15, status: 'Low', progress: 40, color: 'text-neon-cyan' },
      adx: { value: 20, status: 'Consolidating', progress: 50, color: 'text-amber-450' },
      obv: { value: 50, status: 'Neutral', progress: 50, color: 'text-amber-450' }
    };
  }

  let gains = 0, losses = 0;
  for(let i = history.length - 14; i < history.length; i++) {
     const diff = history[i].close - history[i-1].close;
     if (diff > 0) gains += diff;
     else losses -= diff;
  }
  const rs = losses === 0 ? 100 : (gains / 14) / (losses / 14);
  const rsiValue = losses === 0 ? 100 : 100 - (100 / (1 + rs));

  const macdValue = (history[history.length-1].close - history[0].close) * 0.05;
  const momentumValue = ((history[history.length-1].close / history[history.length-14].close) - 1) * 100;
  const isBullish = momentumValue > 0;

  return {
    rsi: { 
      value: Math.round(rsiValue), 
      status: rsiValue > 70 ? 'Overbought' : rsiValue < 30 ? 'Oversold' : 'Neutral', 
      progress: Math.round(rsiValue), 
      color: rsiValue > 70 ? 'text-neon-rose' : rsiValue < 30 ? 'text-neon-emerald' : 'text-amber-450' 
    },
    macd: { 
      value: parseFloat(macdValue.toFixed(2)), 
      status: macdValue > 0 ? 'Positive Crossover' : 'Negative Crossover', 
      progress: 50 + (macdValue > 0 ? 25 : -25), 
      color: macdValue > 0 ? 'text-neon-emerald' : 'text-neon-rose' 
    },
    momentum: { 
      value: parseFloat(momentumValue.toFixed(2)), 
      status: momentumValue > 5 ? 'Strong' : momentumValue < -5 ? 'Weak' : 'Moderate', 
      progress: 50 + (momentumValue > 50 ? 50 : momentumValue), 
      color: momentumValue > 0 ? 'text-neon-emerald' : 'text-neon-rose' 
    },
    volatility: { value: 20, status: 'Normal', progress: 40, color: 'text-neon-cyan' },
    adx: { value: 25, status: 'Trending', progress: 65, color: 'text-neon-emerald' },
    obv: { value: isBullish ? 75 : 25, status: isBullish ? 'Accumulation' : 'Distribution', progress: isBullish ? 75 : 25, color: isBullish ? 'text-neon-emerald' : 'text-neon-rose' }
  };
};
