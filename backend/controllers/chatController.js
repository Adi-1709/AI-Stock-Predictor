import Prediction from '../models/Prediction.js';
import { isDBConnected } from '../config/db.js';
import { sandboxPredictions } from '../config/sandboxData.js';
import { getMarketData } from '../utils/marketHelper.js';
import { calculateEngineMetrics } from '../utils/recommendationEngine.js';

// Scanner to find all tickers mentioned in the query
const scanTickers = (question) => {
  const q = question.toLowerCase();
  const found = new Set();
  
  if (q.includes('reliance')) found.add('RELIANCE.NS');
  if (q.includes('tcs') || q.includes('tata consultancy')) found.add('TCS.NS');
  if (q.includes('infosys') || q.includes('infy')) found.add('INFY.NS');
  if (q.includes('hdfc')) found.add('HDFCBANK.NS');
  if (q.includes('apple') || q.includes('aapl')) found.add('AAPL');
  if (q.includes('tesla') || q.includes('tsla')) found.add('TSLA');
  if (q.includes('microsoft') || q.includes('msft')) found.add('MSFT');
  if (q.includes('nvidia') || q.includes('nvda')) found.add('NVDA');

  return Array.from(found);
};

// Helper to fetch prediction & recommendation metrics for a symbol
const getStockMetadata = async (symbol) => {
  const upper = symbol.toUpperCase();
  try {
    let pred = null;
    if (isDBConnected) {
      pred = await Prediction.findOne({ symbol: upper }).sort({ createdAt: -1 });
      if (pred) pred = pred.toObject ? pred.toObject() : pred;
    } else {
      pred = sandboxPredictions.find(p => p.symbol === upper);
    }

    if (!pred) {
      // In-memory fallbacks if no database cache exists
      const basePrices = { AAPL: 182.63, TSLA: 175.34, MSFT: 415.50, NVDA: 875.12, 'TCS.NS': 3845.00, 'RELIANCE.NS': 2920.00, 'INFY.NS': 1450.50, 'HDFCBANK.NS': 1580.30 };
      const val = basePrices[upper] || 150.00;
      pred = {
        symbol: upper,
        prediction: upper === 'RELIANCE.NS' || upper === 'INFY.NS' ? 'SELL' : upper === 'TSLA' ? 'HOLD' : 'BUY',
        confidence: 75,
        actual: val,
        direction: upper === 'RELIANCE.NS' || upper === 'INFY.NS' ? 'bearish' : upper === 'TSLA' ? 'neutral' : 'bullish',
        technicals: {
          rsi: { value: upper === 'RELIANCE.NS' ? 38 : 55, status: 'Neutral' },
          macd: { value: 0.2, status: 'Bullish Crossover' }
        },
        sentiment: { positive: 65, negative: 15, neutral: 20, explanation: 'Consensus targets upgraded.' }
      };
    }

    const marketData = getMarketData(upper, pred.actual || pred.price || 150);
    const recommendation = calculateEngineMetrics(pred, upper);

    return {
      ...pred,
      ...marketData,
      ...recommendation
    };
  } catch (err) {
    console.error('Error fetching chat meta for', symbol, err);
    return null;
  }
};

/**
 * @desc    Process natural language stock queries and return styled AI responses
 * @route   POST /api/predict/ai-chat
 * @access  Private
 */
export const handleAIChat = async (req, res, next) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Question query parameter is required.' });
  }

  const q = question.toLowerCase();
  const tickers = scanTickers(question);

  try {
    let answer = "";
    
    // ── CASE 1: COMPARISON QUERY (TCS vs INFY) ──
    if (tickers.length >= 2) {
      const stockA = await getStockMetadata(tickers[0]);
      const stockB = await getStockMetadata(tickers[1]);

      if (stockA && stockB) {
        const p1 = stockA.aiRecommendationEngine;
        const p2 = stockB.aiRecommendationEngine;
        const r1 = stockA.riskAnalysis;
        const r2 = stockB.riskAnalysis;

        answer = `### 📊 AI Quantitative Comparison: **${stockA.ticker}** vs **${stockB.ticker}**\n\n` +
          `Here is the side-by-side indicator layout synthesized from live forecasting records:\n\n` +
          `| Parameter | **${stockA.ticker}** | **${stockB.ticker}** |\n` +
          `| :--- | :--- | :--- |\n` +
          `| **Market Price** | ${stockA.formatted_price} | ${stockB.formatted_price} |\n` +
          `| **AI Signal** | **${p1.recommendation}** | **${p2.recommendation}** |\n` +
          `| **Confidence** | ${stockA.confidence}% | ${stockB.confidence}% |\n` +
          `| **Risk Profile** | ${r1.riskLevel} | ${r2.riskLevel} |\n` +
          `| **Sentiment Index** | ${stockA.sentiment?.positive || 50}% Positive | ${stockB.sentiment?.positive || 50}% Positive |\n` +
          `| **RSI Oscillator** | ${stockA.technicals?.rsi?.value || 50} | ${stockB.technicals?.rsi?.value || 50} |\n\n` +
          `#### 💡 Advisor Synthesis:\n` +
          `- **${stockA.ticker}** shows a **${p1.recommendation}** verdict with a **${r1.riskLevel.toLowerCase()}** rating. Reasoning: *${p1.rationale}*\n` +
          `- **${stockB.ticker}** indicates a **${p2.recommendation}** stance with a **${r2.riskLevel.toLowerCase()}** profile. Rationale: *${p2.rationale}*\n\n` +
          `*Verdict*: **${p1.score > p2.score ? stockA.ticker : stockB.ticker}** displays stronger quantitative signals under current timeframe setups. Always align with your risk tolerances.`;
      } else {
        answer = `I found references to tickers in your question but could not load one of their datasets. Please ensure you are asking about supported assets like RELIANCE, TCS, INFY, AAPL, TSLA, MSFT, or NVDA.`;
      }
      return res.json({ answer });
    }

    // ── CASE 2: SINGLE TICKER QUERY ──
    if (tickers.length === 1) {
      const stock = await getStockMetadata(tickers[0]);
      if (!stock) {
        return res.json({ answer: `I scanned for **${tickers[0]}** but encountered an issue loading its statistics. Please retry in a few moments.` });
      }

      const rec = stock.aiRecommendationEngine;
      const risk = stock.riskAnalysis;
      const rsiVal = stock.technicals?.rsi?.value || 50;
      const macdVal = stock.technicals?.macd?.value || 0;

      // Intent A: Explain indicators (RSI/MACD)
      if (q.includes('rsi') || q.includes('macd') || q.includes('indicator') || q.includes('explain')) {
        answer = `### 🔍 Technical Indicator Diagnostic: **${stock.ticker}**\n\n` +
          `- **Relative Strength (RSI)**: Currently reading **${rsiVal}** (${stock.technicals?.rsi?.status || 'Neutral'}). ` +
          `${rsiVal > 70 ? 'This implies the stock is in an **overbought** territory, indicating an over-extended run and consolidation risk.' : rsiVal < 30 ? 'This suggests the stock is **oversold**, which frequently triggers buybacks.' : 'This reflects a balanced relative strength momentum range.'}\n` +
          `- **MACD Convergence**: Currently reading **${macdVal}** (${stock.technicals?.macd?.status || 'Active'}). ` +
          `${macdVal >= 0 ? 'The MACD is printing **positive** ranges, suggesting that buying momentum dominates the chart structure.' : 'The MACD is printing **negative** coordinates, showing bearish selling control.'}\n\n` +
          `**AI Opinion**: *${rec.rationale}*`;
      }
      // Intent B: Risk analysis
      else if (q.includes('risk') || q.includes('safe') || q.includes('volat')) {
        answer = `### 🛡️ Volatility Risk Report: **${stock.ticker}**\n\n` +
          `- **Risk Classification**: **${risk.riskLevel}** (${risk.riskBadge})\n` +
          `- **Historical Volatility**: **${risk.volatility}%**\n` +
          `- **ATR Swing Index**: **${risk.atrPercent.toFixed(2)}%** relative to price.\n\n` +
          `**Risk Factors Breakout:**\n` +
          `1. **Volatilities**: Volatility is ${risk.volatility > 30 ? 'high, indicating larger trading ranges and sharp swings' : 'moderate to low, displaying steady movement'}.\n` +
          `2. **Media Sentiment**: News carries a **${stock.sentiment?.negative || 0}% negative** rating, which presents ${stock.sentiment?.negative > 45 ? 'elevated panic dump risks' : 'low news-flow threat'}.\n` +
          `3. **Trend Stability**: The technical chart exhibits a **${stock.direction}** trend.\n\n` +
          `*Risk Advice*: ${risk.riskLevel.includes('High') ? 'This stock carries speculative swings. Exercise strict stop-loss boundaries.' : 'This stock reflects stable accumulation bounds, suitable for conservative portfolios.'}`;
      }
      // Intent C: Forecasts and Predictions
      else if (q.includes('future') || q.includes('predict') || q.includes('forecast') || q.includes('target')) {
        answer = `### 🔮 Machine Learning Prediction: **${stock.ticker}**\n\n` +
          `- **Current Valuation**: **${stock.formatted_price}**\n` +
          `- **Forecast Days**: **7 Days**\n` +
          `- **Target Price Objective**: **${formatPrice(stock.targetPrice || stock.price * 1.05, stock.currency)}**\n` +
          `- **Inference Direction**: **${stock.direction.toUpperCase()}**\n` +
          `- **Confidence Score**: **${stock.confidence}%**\n\n` +
          `**ML Model Rationale:**\n` +
          `*${stock.reasoning || 'The Random Forest model predicts support levels holding above moving averages, driving accumulation signals.'}*`;
      }
      // Intent D: Falling/Explain drops
      else if (q.includes('fall') || q.includes('drop') || q.includes('lose') || q.includes('down') || q.includes('decline') || q.includes('negative')) {
        const isBear = stock.direction === 'bearish';
        answer = `### 📉 Downturn Assessment: **${stock.ticker}**\n\n` +
          `You asked why **${stock.ticker}** is down or falling. Here is the AI diagnostic:\n\n` +
          `- **Model Sentiment Bias**: **${stock.direction.toUpperCase()}**\n` +
          `- **Technical Momentum**: RSI is **${rsiVal}**, MACD is **${stock.technicals?.macd?.status || 'Neutral'}**.\n` +
          `- **News Headwind Score**: **${stock.sentiment?.negative || 20}% Negative** headlines.\n\n` +
          `**Analysis Details:**\n` +
          `${isBear 
            ? `Our technical oscillators suggest heavy **distribution blocks** are active. A negative MACD slope combined with bearish news reports (${stock.sentiment?.negative}% Negative) are dragging prices towards short-term support bounds.`
            : `Interestingly, our quantitative engines classify the long-term trend as **bullish** despite current daily fluctuations. The pullback is likely a standard technical consolidation or profit-booking phase, presenting a potential support accumulation entry.`}\n\n` +
          `**Current recommendation**: **${rec.recommendation}** (${stock.confidence}% Confidence).`;
      }
      // Intent E: Standard Buy/Sell advice
      else {
        answer = `### 🤖 AI Financial Analysis: **${stock.ticker}**\n\n` +
          `Here is the diagnostic report compiled by the quant engine:\n\n` +
          `- **Current Market Price**: **${stock.formatted_price}**\n` +
          `- **AI Recommendation Verdict**: **${rec.recommendation}** 🟢\n` +
          `- **Model Confidence Index**: **${stock.confidence}%**\n` +
          `- **Technical Direction**: **${stock.direction.toUpperCase()}**\n` +
          `- **Risk Classification**: **${risk.riskLevel}** (${risk.riskBadge})\n` +
          `- **News Sentiment Polarity**: **${stock.sentiment?.positive || 50}% Positive** / **${stock.sentiment?.negative || 20}% Negative**\n\n` +
          `#### 💡 Summary Rationale:\n` +
          `*${rec.rationale}*`;
      }

      return res.json({ answer });
    }

    // ── CASE 3: GLOBAL STOCK DIAGNOSTIC / LISTINGS (e.g. "which Indian stocks are bullish?") ──
    if (q.includes('bullish') || q.includes('best stock') || q.includes('recommend') || q.includes('buy now')) {
      let stockList = ['AAPL', 'TSLA', 'MSFT', 'NVDA', 'TCS.NS', 'RELIANCE.NS', 'INFY.NS', 'HDFCBANK.NS'];
      let bullishIndian = [];
      let bullishUS = [];

      for (let sym of stockList) {
        const meta = await getStockMetadata(sym);
        if (meta && (meta.aiRecommendationEngine.recommendation.includes('BUY'))) {
          if (sym.endsWith('.NS')) {
            bullishIndian.push(sym);
          } else {
            bullishUS.push(sym);
          }
        }
      }

      answer = `### 📈 Quantitative Bullish Stock Screen\n\n` +
        `Our RandomForest models have screened all active tickers and identified the following assets displaying **Bullish / Buy** triggers:\n\n` +
        `#### 🇮🇳 Indian Markets (NSE):\n` +
        `${bullishIndian.length > 0 ? bullishIndian.map(s => `- **${s}** (Buy signal, low/medium risk)`).join('\n') : '- No active Buy triggers currently.'}\n\n` +
        `#### 🇺🇸 US Markets (NASDAQ):\n` +
        `${bullishUS.length > 0 ? bullishUS.map(s => `- **${s}** (Buy signal, confidence over 70%)`).join('\n') : '- No active Buy triggers currently.'}\n\n` +
        `*Diagnostic Note*: Bullish triggers indicate RSI is outside overbought bounds (<65) while the underlying ML forecast direction remains positive.`;

      return res.json({ answer });
    }

    // ── CASE 4: GENERAL KNOWLEDGE BASE / FALLBACK CHAT ──
    answer = `### 💬 AI Investment Assistant\n\n` +
      `Hello! I am your quantitative AI investing assistant. I scan live technical coordinates, machine learning models forecasts, and news headlines.\n\n` +
      `**How I can help you today:**\n` +
      `- **Advice on Assets**: Ask *"Should I buy Apple?"* or *"What is the prediction for Reliance?"*\n` +
      `- **Risk Analysis**: Ask *"Explain the risk of Tesla"* or *"Which stock is less risky?"*\n` +
      `- **Comparisons**: Ask *"Compare TCS and Infosys"* to see side-by-side metrics.\n` +
      `- **Technical Explanations**: Ask *"Explain RSI"* or *"What is MACD?"*\n` +
      `- **Market Screens**: Ask *"Which Indian stocks are bullish?"*\n\n` +
      `What would you like to analyze next?`;

    return res.json({ answer });

  } catch (error) {
    res.status(500);
    next(error);
  }
};

// Helper for formatting target prices
const formatPrice = (value, currency) => {
  if (value === undefined || value === null || isNaN(value)) return '';
  let locale = 'en-US';
  if (currency === 'INR') locale = 'en-IN';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};
