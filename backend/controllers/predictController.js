import Prediction from '../models/Prediction.js';
import ActivityLog from '../models/ActivityLog.js';
import { isDBConnected } from '../config/db.js';
import { sandboxPredictions, sandboxActivityLogs } from '../config/sandboxData.js';
import { generatePrediction, generateTechnicals } from '../services/aiService.js';
import { getMarketData } from '../utils/marketHelper.js';
import { calculateEngineMetrics } from '../utils/recommendationEngine.js';

/**
 * @desc    Get detailed AI prediction analysis for a ticker
 * @route   GET /api/predict/:symbol
 * @access  Private
 */
export const getStockPrediction = async (req, res, next) => {
  const { symbol } = req.params;
  const upperSymbol = symbol.toUpperCase();

  try {
    // 1. Check if we have a fresh prediction saved (last 1 hour to prevent redundant external ML calls)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    let predictionRecord;

    if (isDBConnected) {
      predictionRecord = await Prediction.findOne({
        symbol: upperSymbol,
        createdAt: { $gte: oneHourAgo }
      }).sort({ createdAt: -1 });
    } else {
      predictionRecord = sandboxPredictions.find(
        p => p.symbol === upperSymbol && new Date(p.createdAt) >= oneHourAgo
      );
    }

    if (!predictionRecord) {
      console.log(`🤖 [Predict Controller] Querying Flask ML service for ticker: ${upperSymbol}`);
      let mlData = null;

      try {
        // Query the Flask microservice
        const response = await fetch(`http://localhost:8000/predict?ticker=${upperSymbol}`);
        if (response.ok) {
          mlData = await response.json();
          console.log(`✅ [Predict Controller] Loaded ML model inference for: ${upperSymbol}`);
        } else {
          console.warn(`⚠️ [Predict Controller] ML API responded with status: ${response.status}`);
        }
      } catch (err) {
        console.warn(`⚠️ [Predict Controller] ML API connection refused: ${err.message}. Falling back to simulation.`);
      }

      let newPredData;
      if (mlData) {
        // Map Flask ML outputs to Prediction Schema
        const dir = mlData.technical_signal.toLowerCase(); // bullish, bearish, neutral
        const technicals = generateTechnicals(dir); // generate indicator components mapping
        
        // Enrich indicators with actual live features calculated by Flask
        if (mlData.features) {
          if (technicals.rsi) technicals.rsi.value = Math.round(mlData.features.RSI);
          if (technicals.macd) technicals.macd.value = parseFloat(mlData.features.MACD.toFixed(3));
        }

        newPredData = {
          symbol: upperSymbol,
          prediction: mlData.prediction,
          confidence: mlData.confidence,
          targetPrice: mlData.features ? parseFloat((mlData.features.Close * (dir === 'bullish' ? 1.12 : dir === 'bearish' ? 0.88 : 1.01)).toFixed(2)) : 150.00,
          forecastDays: 7,
          direction: dir,
          recommendation: mlData.prediction === 'BUY' ? 'Strong Buy' : mlData.prediction === 'SELL' ? 'Strong Sell' : 'Hold',
          strength: mlData.confidence > 80 ? 'High' : mlData.confidence > 60 ? 'Moderate' : 'Low',
          reasoning: `Inference from RandomForestClassifier model completed. Features extracted from Yahoo Finance: Close=${mlData.features?.Close.toFixed(2)}, RSI=${mlData.features?.RSI.toFixed(1)}, MACD=${mlData.features?.MACD.toFixed(2)}. Sentiment index represents a ${mlData.market_sentiment} outlook.`,
          technicals,
          sentiment: {
            positive: dir === 'bullish' ? 75 : dir === 'bearish' ? 15 : 45,
            negative: dir === 'bearish' ? 75 : dir === 'bullish' ? 15 : 35,
            neutral: dir === 'neutral' ? 50 : 20,
            explanation: `Market index exhibits a ${mlData.market_sentiment} sentiment consensus.`
          },
          status: 'Pending',
          actual: mlData.features ? parseFloat(mlData.features.Close.toFixed(2)) : 0,
          features: mlData.features
        };
      } else {
        // Fallback simulated forecasting if Flask ML is offline
        const getSimulatedBasePrice = (sym) => {
          const upper = sym.toUpperCase();
          if (upper.includes('AAPL')) return 180;
          if (upper.includes('TSLA')) return 175;
          if (upper.includes('MSFT')) return 415;
          if (upper.includes('NVDA')) return 875;
          if (upper.includes('TCS')) return 3800;
          if (upper.includes('RELIANCE')) return 2900;
          if (upper.includes('INFY')) return 1450;
          if (upper.includes('HDFCBANK')) return 1550;
          return 150;
        };
        const base = getSimulatedBasePrice(upperSymbol);
        const simulatedPrice = parseFloat((base * (0.95 + Math.random() * 0.1)).toFixed(2));
        const prediction = generatePrediction(upperSymbol, simulatedPrice);
        const technicals = generateTechnicals(prediction.direction);
        
        newPredData = {
          symbol: upperSymbol,
          prediction: prediction.recommendation.includes('Buy') ? 'BUY' : prediction.recommendation.includes('Sell') ? 'SELL' : 'HOLD',
          confidence: prediction.confidence,
          targetPrice: prediction.targetPrice,
          forecastDays: prediction.forecastDays,
          direction: prediction.direction,
          recommendation: prediction.recommendation,
          strength: prediction.strength,
          reasoning: prediction.reasoning,
          technicals: technicals,
          sentiment: {
            positive: prediction.direction === 'bullish' ? 70 : prediction.direction === 'bearish' ? 20 : 45,
            negative: prediction.direction === 'bearish' ? 70 : prediction.direction === 'bullish' ? 20 : 35,
            neutral: prediction.direction === 'neutral' ? 20 : 10,
            explanation: `Simulated AI model forecast runs completed for ticker ${upperSymbol}. Technical patterns support a ${prediction.direction} outlook.`
          },
          status: 'Pending',
          actual: simulatedPrice,
          features: {
            Close: simulatedPrice,
            MA5: parseFloat((simulatedPrice * (0.98 + Math.random() * 0.04)).toFixed(2)),
            MA20: parseFloat((simulatedPrice * (0.95 + Math.random() * 0.1)).toFixed(2)),
            RSI: technicals.rsi?.value || 50,
            MACD: parseFloat((technicals.macd?.value || 0.0).toFixed(3)),
            Volume: Math.floor(Math.random() * 1000000) + 100000
          }
        };
      }

      // Save to appropriate data store
      if (isDBConnected) {
        predictionRecord = await Prediction.create(newPredData);
      } else {
        predictionRecord = {
          _id: `p-${Date.now()}`,
          ...newPredData,
          createdAt: new Date()
        };
        sandboxPredictions.unshift(predictionRecord);
      }
    }

    // Register user activity audit log
    const logDetails = {
      user: req.user._id || req.user.id,
      action: 'VIEW_PREDICTION',
      details: `Viewed AI prediction for ticker ${upperSymbol}`,
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || '',
      createdAt: new Date()
    };

    if (isDBConnected) {
      await ActivityLog.create(logDetails);
    } else {
      sandboxActivityLogs.unshift(logDetails);
    }

    const recordObj = predictionRecord.toObject ? predictionRecord.toObject() : predictionRecord;
    const marketData = getMarketData(upperSymbol, recordObj.actual);
    const recommendationMetrics = calculateEngineMetrics(recordObj, upperSymbol);

    res.json({
      ...recordObj,
      ...marketData,
      ...recommendationMetrics
    });
  } catch (error) {
    res.status(500);
    next(error);
  }
};

/**
 * @desc    Get historical stock data with metadata from yfinance (or simulation fallback)
 * @route   GET /api/predict/history/:symbol
 * @access  Private
 */
export const getStockHistory = async (req, res, next) => {
  const { symbol } = req.params;
  const period = req.query.period || '1y';
  const upperSymbol = symbol.toUpperCase();

  try {
    console.log(`🤖 [Predict Controller] Fetching history from Flask for: ${upperSymbol} (${period})`);
    let historyData = null;

    try {
      const response = await fetch(`http://localhost:8000/history/${upperSymbol}?period=${period}`);
      if (response.ok) {
        historyData = await response.json();
      } else {
        console.warn(`⚠️ [Predict Controller] Flask history route failed: ${response.status}`);
      }
    } catch (err) {
      console.warn(`⚠️ [Predict Controller] Flask history offline: ${err.message}. Falling back to simulation.`);
    }

    if (historyData) {
      const marketData = getMarketData(upperSymbol, historyData.meta.currentPrice);
      return res.json({
        ...historyData,
        meta: {
          ...historyData.meta,
          ...marketData
        }
      });
    }

    // ── FALLBACK SIMULATION GENERATOR ──
    const getSimulatedBasePrice = (sym) => {
      const upper = sym.toUpperCase();
      if (upper.includes('AAPL')) return 180;
      if (upper.includes('TSLA')) return 175;
      if (upper.includes('MSFT')) return 415;
      if (upper.includes('NVDA')) return 875;
      if (upper.includes('TCS')) return 3800;
      if (upper.includes('RELIANCE')) return 2900;
      if (upper.includes('INFY')) return 1450;
      if (upper.includes('HDFCBANK')) return 1550;
      return 150;
    };

    const basePrice = getSimulatedBasePrice(upperSymbol);
    
    // Determine configuration based on period
    let points = 250;
    let intervalMinutes = 1440; // 1 day
    switch (period.toLowerCase()) {
      case '1d':
        points = 24;
        intervalMinutes = 30; // 30 mins
        break;
      case '5d':
        points = 40;
        intervalMinutes = 60; // 1 hour
        break;
      case '1mo':
        points = 30;
        intervalMinutes = 1440;
        break;
      case '6mo':
        points = 130;
        intervalMinutes = 1440;
        break;
      case '1y':
      default:
        points = 250;
        intervalMinutes = 1440;
        break;
      case 'max':
        points = 500;
        intervalMinutes = 1440 * 7; // weekly
        break;
    }

    let historyList = [];
    let currentWalkPrice = basePrice * (0.9 + Math.random() * 0.2); // Start somewhere close
    const nowMs = Date.now();

    for (let i = 0; i < points; i++) {
      // Walk price
      const pctChange = (Math.random() - 0.495) * 0.015; // Small random drift
      currentWalkPrice = currentWalkPrice * (1 + pctChange);
      
      const close = parseFloat(currentWalkPrice.toFixed(2));
      const open = parseFloat((close * (1 + (Math.random() - 0.5) * 0.006)).toFixed(2));
      const high = parseFloat((Math.max(open, close) * (1 + Math.random() * 0.007)).toFixed(2));
      const low = parseFloat((Math.min(open, close) * (1 - Math.random() * 0.007)).toFixed(2));
      const volume = Math.floor(Math.random() * 500000) + 50000;

      // Calculate historical dates counting back
      const stepMs = (points - 1 - i) * intervalMinutes * 60 * 1000;
      const stepDate = new Date(nowMs - stepMs);
      
      let dateStr;
      if (period.toLowerCase() === '1d' || period.toLowerCase() === '5d') {
        // Format with time
        const pad = (n) => String(n).padStart(2, '0');
        dateStr = `${stepDate.getFullYear()}-${pad(stepDate.getMonth() + 1)}-${pad(stepDate.getDate())} ${pad(stepDate.getHours())}:${pad(stepDate.getMinutes())}`;
      } else {
        // Daily
        const pad = (n) => String(n).padStart(2, '0');
        dateStr = `${stepDate.getFullYear()}-${pad(stepDate.getMonth() + 1)}-${pad(stepDate.getDate())}`;
      }

      historyList.push({
        date: dateStr,
        open,
        high,
        low,
        close,
        volume
      });
    }

    // Compute meta stats from list
    const closePrices = historyList.map(h => h.close);
    const highPrices = historyList.map(h => h.high);
    const lowPrices = historyList.map(h => h.low);

    const fiftyTwoWeekHigh = Math.max(...highPrices);
    const fiftyTwoWeekLow = Math.min(...lowPrices);
    const currentPrice = closePrices[closePrices.length - 1];
    const firstPrice = closePrices[0];
    const changePercent = ((currentPrice - firstPrice) / firstPrice) * 100;
    
    // Base market cap on price
    let marketCapMultiplier = 100000000; // default multiplier
    if (upperSymbol.includes('AAPL') || upperSymbol.includes('MSFT')) {
      marketCapMultiplier = 15000000000;
    } else if (upperSymbol.includes('RELIANCE')) {
      marketCapMultiplier = 65000000;
    }
    const marketCap = Math.floor(currentPrice * marketCapMultiplier);

    const marketData = getMarketData(upperSymbol, currentPrice);

    return res.json({
      history: historyList,
      meta: {
        fiftyTwoWeekHigh: parseFloat(fiftyTwoWeekHigh.toFixed(2)),
        fiftyTwoWeekLow: parseFloat(fiftyTwoWeekLow.toFixed(2)),
        marketCap,
        currentPrice: parseFloat(currentPrice.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(3)),
        ...marketData
      }
    });

  } catch (error) {
    res.status(500);
    next(error);
  }
};

/**
 * @desc    Get sentiment-analyzed stock news from yfinance (or simulation fallback)
 * @route   GET /api/predict/news/:symbol
 * @access  Private
 */
export const getStockNews = async (req, res, next) => {
  const { symbol } = req.params;
  const upperSymbol = symbol.toUpperCase();

  try {
    console.log(`🤖 [Predict Controller] Fetching news from Flask for: ${upperSymbol}`);
    let newsData = null;

    try {
      const response = await fetch(`http://localhost:8000/news/${upperSymbol}`);
      if (response.ok) {
        newsData = await response.json();
      } else {
        console.warn(`⚠️ [Predict Controller] Flask news route failed: ${response.status}`);
      }
    } catch (err) {
      console.warn(`⚠️ [Predict Controller] Flask news offline: ${err.message}. Falling back to simulation.`);
    }

    if (newsData && newsData.length > 0) {
      return res.json(newsData);
    }

    // ── FALLBACK SIMULATION NEWS GENERATOR ──
    const getSimulatedNews = (sym) => {
      const upper = sym.toUpperCase();
      const todayStr = new Date().toISOString().slice(0, 10);
      const yesterdayStr = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const prevDateStr = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

      if (upper.includes('AAPL')) {
        return [
          {
            title: "Apple launches new AI-capable M5 processors targeting cloud servers",
            source: "Bloomberg Technology",
            date: todayStr,
            summary: "Apple announced a major structural update to its cloud architecture, rolling out next-generation M5 processors to support heavy transformer model workloads on macOS clusters.",
            sentiment: "Positive",
            url: "https://finance.yahoo.com"
          },
          {
            title: "Global iPhone sales exceed consensus targets by 8% in Asian markets",
            source: "Wall Street Journal",
            date: yesterdayStr,
            summary: "Retail check datasets confirm a robust demand cycle for high-end device trims, surpassing local broker targets despite headwinds from premium currency exchange rates.",
            sentiment: "Positive",
            url: "https://finance.yahoo.com"
          },
          {
            title: "Apple faces compliance inquiry in European Union over browser options",
            source: "Reuters Financial",
            date: prevDateStr,
            summary: "Regulatory committees are reviewing consumer default settings on iOS devices, potentially creating localized compliance friction and operational review costs.",
            sentiment: "Negative",
            url: "https://finance.yahoo.com"
          },
          {
            title: "Institutional brokers adjust Apple weighting to overweight ahead of WWDC",
            source: "Yahoo Finance",
            date: prevDateStr,
            summary: "Leading market analysis institutions have upgraded their portfolio weightings for Apple, citing favorable cash margins and expansion into neural silicon lines.",
            sentiment: "Positive",
            url: "https://finance.yahoo.com"
          }
        ];
      } else if (upper.includes('TSLA')) {
        return [
          {
            title: "Tesla schedules full autonomous driving version 13 release in Europe",
            source: "Reuters Markets",
            date: todayStr,
            summary: "Tesla is preparing compliance audits in several EU member states to release beta configurations of its next-generation self-driving systems next quarter.",
            sentiment: "Positive",
            url: "https://finance.yahoo.com"
          },
          {
            title: "Tesla Q2 deliveries build base, but competitive pressure in China remains high",
            source: "Bloomberg News",
            date: yesterdayStr,
            summary: "Vehicle volume distributions indicate moderate growth over last year's base bounds. However, pricing pressure from local EV startups continues to press margins.",
            sentiment: "Neutral",
            url: "https://finance.yahoo.com"
          },
          {
            title: "Elon Musk highlights robotics focus and Optimus rollout progress",
            source: "TechCrunch Finance",
            date: prevDateStr,
            summary: "During shareholder briefings, Tesla executives reiterated a transition toward robotics, AI training nodes, and long-term automated assembly line optimizations.",
            sentiment: "Positive",
            url: "https://finance.yahoo.com"
          },
          {
            title: "Supply check points to temporary assembly adjustments in Texas gigafactory",
            source: "InsideEVs",
            date: prevDateStr,
            summary: "Industrial checks suggest minor component replacements for battery lines are leading to scheduled maintenance halts over the next two weeks.",
            sentiment: "Negative",
            url: "https://finance.yahoo.com"
          }
        ];
      } else if (upper.includes('RELIANCE')) {
        return [
          {
            title: "Reliance retail operations report 14% revenue expansion on digital channels",
            source: "Economic Times India",
            date: todayStr,
            summary: "Reliance Industries Retail wing reported steady revenue increases across tier-2 and tier-3 regions, driven by strong growth in omnichannel e-commerce orders.",
            sentiment: "Positive",
            url: "https://finance.yahoo.com"
          },
          {
            title: "Refining margins contract temporarily amid global crude price volatility",
            source: "Mint Markets",
            date: yesterdayStr,
            summary: "Analysts expect gross refining margins to moderate this quarter following geopolitical supply shifts. Capex for energy segment integrations remains high.",
            sentiment: "Negative",
            url: "https://finance.yahoo.com"
          },
          {
            title: "Jio Infocomm trials next-gen satellite internet integration in rural zones",
            source: "Business Standard",
            date: prevDateStr,
            summary: "Jio has successfully initialized trial sat-com transponders to support remote broadband connectivity, marking structural progress in telecom infrastructure.",
            sentiment: "Positive",
            url: "https://finance.yahoo.com"
          },
          {
            title: "Brokerage firms maintain neutral rating on Reliance Industries ahead of audits",
            source: "CNBC TV18",
            date: prevDateStr,
            summary: "Brokerages cite oil-to-chemicals segment consolidations as a reason to hold neutral stance until quarterly capital allocation models are clarified.",
            sentiment: "Neutral",
            url: "https://finance.yahoo.com"
          }
        ];
      } else {
        // Generic fallback articles
        return [
          {
            title: `${upperSymbol} operations report stable margins in quarterly filings`,
            source: "Financial Times",
            date: todayStr,
            summary: "Detailed statements verify normal revenue margins matching consensus expectations. Capital outlays for software developments are rising.",
            sentiment: "Neutral",
            url: "https://finance.yahoo.com"
          },
          {
            title: `Institutional buying volume expands for ${upperSymbol} on options charts`,
            source: "MarketWatch",
            date: yesterdayStr,
            summary: "Option volumes reflect strong bullish positioning from institutional blocks ahead of upcoming product announcements and earnings reports.",
            sentiment: "Positive",
            url: "https://finance.yahoo.com"
          },
          {
            title: `Compliance filings confirmed for ${upperSymbol} expansion strategy`,
            source: "SEC Filing Audit",
            date: prevDateStr,
            summary: "Regulatory reports show successful clearance for new industrial operations and property integration, paving the way for next-phase logistics expansion.",
            sentiment: "Positive",
            url: "https://finance.yahoo.com"
          }
        ];
      }
    };

    return res.json(getSimulatedNews(upperSymbol));

  } catch (error) {
    res.status(500);
    next(error);
  }
};



