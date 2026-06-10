/**
 * Smart recommendation engine & Risk classifier
 * Combines ML, RSI, MACD, and news sentiment to yield final investment guidance.
 */
export const calculateEngineMetrics = (pred, symbol) => {
  const upper = symbol.toUpperCase();
  const dir = pred.direction?.toLowerCase() || 'neutral';
  
  // ── AI BUY/SELL ENGINE SCORING (Scale -10 to +10) ──
  let score = 0;
  if (pred.prediction === 'BUY') score += 4;
  else if (pred.prediction === 'SELL') score -= 4;
  
  // RSI momentum boundaries
  const rsiVal = pred.rsi || (pred.technicals?.rsi?.value) || 50;
  let rsiSignal = 'Neutral';
  if (rsiVal > 70) {
    score -= 2.5; // Overbought condition
    rsiSignal = 'Bearish (Overbought)';
  } else if (rsiVal < 30) {
    score += 2.5; // Oversold condition
    rsiSignal = 'Bullish (Oversold)';
  } else if (rsiVal > 55) {
    score += 1.0;
    rsiSignal = 'Bullish momentum';
  } else if (rsiVal < 45) {
    score -= 1.0;
    rsiSignal = 'Bearish pressure';
  }

  // MACD indicator check
  const macdVal = pred.macd || (pred.technicals?.macd?.value) || 0;
  const macdStatus = (pred.technicals?.macd?.status || '').toLowerCase();
  let macdSignal = 'Neutral';
  if (macdStatus.includes('cross') || macdStatus.includes('bullish') || macdVal > 0) {
    score += 1.5;
    macdSignal = 'Bullish crossover';
  } else if (macdStatus.includes('bearish') || macdVal < 0) {
    score -= 1.5;
    macdSignal = 'Bearish crossover';
  }

  // News NLP analysis sentiment
  const positiveSent = pred.sentiment?.positive || 50;
  const negativeSent = pred.sentiment?.negative || 20;
  let newsSignal = 'Neutral';
  if (positiveSent > negativeSent + 15) {
    score += 2.0;
    newsSignal = 'Bullish News flow';
  } else if (negativeSent > positiveSent + 15) {
    score -= 2.0;
    newsSignal = 'Bearish News flow';
  }

  // General price trend bias
  let trendSignal = 'Neutral';
  if (dir === 'bullish') {
    score += 1.0;
    trendSignal = 'Bullish trend';
  } else if (dir === 'bearish') {
    score -= 1.0;
    trendSignal = 'Bearish trend';
  }

  // Model confidence index scaling
  const confidence = pred.confidence || 50;
  if (confidence > 80) {
    if (score > 0) score += 1.0;
    else if (score < 0) score -= 1.0;
  }

  // Classification logic
  let recommendation = 'HOLD';
  let badgeColor = 'text-amber-400 border-amber-500/20 bg-amber-500/10 shadow-[0_0_12px_rgba(245,158,11,0.05)]';
  let glowClass = 'glow-badge-hold';
  
  if (score >= 6) {
    recommendation = 'STRONG BUY';
    badgeColor = 'text-neon-emerald border-neon-emerald/20 bg-neon-emerald/10 shadow-[0_0_12px_rgba(0,255,102,0.1)]';
    glowClass = 'glow-badge-buy';
  } else if (score >= 2) {
    recommendation = 'BUY';
    badgeColor = 'text-neon-emerald border-neon-emerald/20 bg-neon-emerald/10 shadow-[0_0_12px_rgba(0,255,102,0.05)]';
    glowClass = 'glow-badge-buy';
  } else if (score <= -6) {
    recommendation = 'STRONG SELL';
    badgeColor = 'text-neon-rose border-neon-rose/20 bg-neon-rose/10 shadow-[0_0_12px_rgba(255,45,85,0.1)]';
    glowClass = 'glow-badge-sell';
  } else if (score <= -2) {
    recommendation = 'SELL';
    badgeColor = 'text-neon-rose border-neon-rose/20 bg-neon-rose/10 shadow-[0_0_12px_rgba(255,45,85,0.05)]';
    glowClass = 'glow-badge-sell';
  }

  const factors = [
    { name: 'RandomForest Prediction', signal: pred.prediction, weight: pred.prediction === 'BUY' ? 'Bullish' : pred.prediction === 'SELL' ? 'Bearish' : 'Neutral' },
    { name: 'RSI Momentum Index', signal: `${rsiVal} (${rsiSignal})`, weight: rsiVal > 55 ? 'Bullish' : rsiVal < 45 ? 'Bearish' : 'Neutral' },
    { name: 'MACD Signal Status', signal: macdSignal, weight: macdVal >= 0 ? 'Bullish' : 'Bearish' },
    { name: 'News Sentiment Polarity', signal: newsSignal, weight: positiveSent > negativeSent ? 'Bullish' : 'Bearish' }
  ];

  const rationale = `The smart quantitative optimizer compiled a ${recommendation} recommendation for ${upper}. This rating incorporates a ${factors[0].weight.toLowerCase()} model forecast, combined with a ${factors[1].weight.toLowerCase()} RSI signal, and reinforced by ${factors[3].signal.toLowerCase()} in news headlines.`;

  // ── RISK SCORE CALCULATION ──
  const volatility = pred.features?.volatility || (upper.includes('TSLA') ? 38 : upper.includes('AAPL') ? 18 : 22);
  const atrVal = pred.features?.ATR || (upper.includes('TSLA') ? 8.5 : upper.includes('AAPL') ? 3.2 : 5);
  const priceVal = pred.features?.Close || pred.actual || 150;
  
  const atrPercent = (atrVal / priceVal) * 100;
  
  let riskPoints = 0;
  if (volatility > 30) riskPoints += 2;
  else if (volatility > 18) riskPoints += 1;
  
  if (atrPercent > 2.5) riskPoints += 2;
  else if (atrPercent > 1.2) riskPoints += 1;
  
  if (negativeSent > 45) riskPoints += 1;
  if (dir === 'bearish') riskPoints += 1;

  let riskLevel = 'Medium Risk';
  let riskColor = 'text-amber-400 border-amber-500/20 bg-amber-500/10 shadow-[0_0_12px_rgba(245,158,11,0.05)]';
  let riskBadge = '🟡 Medium';
  if (riskPoints <= 1) {
    riskLevel = 'Low Risk';
    riskColor = 'text-neon-emerald border-neon-emerald/20 bg-neon-emerald/10 shadow-[0_0_12px_rgba(0,255,102,0.05)]';
    riskBadge = '🟢 Low';
  } else if (riskPoints >= 4) {
    riskLevel = 'High Risk';
    riskColor = 'text-neon-rose border-neon-rose/20 bg-neon-rose/10 shadow-[0_0_12px_rgba(255,45,85,0.05)]';
    riskBadge = '🔴 High';
  }

  const riskFactors = [
    { name: 'Historical Volatility', value: `${volatility}%`, status: volatility > 30 ? 'Elevated volatility swing' : 'Stable' },
    { name: 'ATR/Price Threshold', value: `${atrPercent.toFixed(2)}%`, status: atrPercent > 2.5 ? 'Wide daily ranges' : 'Consolidating' },
    { name: 'News Headlines Negative', value: `${negativeSent}% Neg`, status: negativeSent > 45 ? 'Bearish media shifts' : 'Favorable consensus' },
    { name: 'Model Trend Indicator', value: dir.toUpperCase(), status: dir === 'bearish' ? 'Sell pressures active' : 'Supportive trend' }
  ];

  return {
    aiRecommendationEngine: {
      recommendation,
      rationale,
      factors,
      score,
      badgeColor,
      glowClass
    },
    riskAnalysis: {
      riskLevel,
      riskColor,
      riskBadge,
      riskPoints,
      volatility,
      atrPercent: parseFloat(atrPercent.toFixed(3)),
      factors: riskFactors
    }
  };
};
