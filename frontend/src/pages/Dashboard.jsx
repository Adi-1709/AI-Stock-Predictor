import React, {
  useState,
  useMemo,
  useEffect
} from 'react';
import { predictStock } from '../services/predictionService.js';
import api from '../services/api.js';
import { useStockData } from '../hooks/useStockData';
import { useStock } from '../context/StockContext';
import { formatCurrency, formatPercent, formatVolume } from '../utils/formatters';
import MarketStats from '../components/MarketStats';
import StockSearch from '../components/StockSearch';
import Watchlist from '../components/Watchlist';
import LoadingSpinner from '../components/LoadingSpinner';
import DashboardSkeleton from '../components/DashboardSkeleton';
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Cell,
  Pie
} from 'recharts';
import {
  FiTrendingUp,
  FiTrendingDown,
  FiActivity,
  FiCpu,
  FiCompass,
  FiBookmark,
  FiSettings,
  FiTarget,
  FiTrendingUp as FiBuy,
  FiTrendingDown as FiSell,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiArrowUpRight,
  FiArrowDownRight,
  FiAward,
  FiDownload,
  FiAlertTriangle,
  FiShield,
  FiZap
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const LOGO_COLORS = {
  AAPL: 'from-slate-700 to-slate-500 text-slate-100',
  TSLA: 'from-rose-600 to-rose-400 text-white',
  MSFT: 'from-blue-600 to-sky-400 text-white',
  NVDA: 'from-emerald-600 to-green-400 text-white',
  'TCS.NS': 'from-indigo-600 to-blue-500 text-white',
  'RELIANCE.NS': 'from-orange-600 to-amber-500 text-white',
  'INFY.NS': 'from-sky-600 to-indigo-500 text-white',
  'HDFCBANK.NS': 'from-blue-700 to-blue-500 text-white',
};

const getLogoClass = (sym) => {
  const upper = sym ? sym.toUpperCase() : '';
  if (LOGO_COLORS[upper]) return LOGO_COLORS[upper];
  const charSum = upper.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const gradients = [
    'from-indigo-600 to-purple-500 text-white',
    'from-teal-600 to-emerald-500 text-white',
    'from-pink-600 to-rose-500 text-white',
    'from-violet-600 to-fuchsia-500 text-white',
    'from-orange-600 to-red-500 text-white',
    'from-cyan-600 to-blue-500 text-white'
  ];
  return gradients[charSum % gradients.length];
};

const getMarketStatus = (marketName) => {
  const now = new Date();
  let timezone = 'America/New_York';
  let openTime = { hour: 9, minute: 30 };
  let closeTime = { hour: 16, minute: 0 };

  if (marketName === 'India') {
    timezone = 'Asia/Kolkata';
    openTime = { hour: 9, minute: 15 };
    closeTime = { hour: 15, minute: 30 };
  } else if (marketName === 'UK') {
    timezone = 'Europe/London';
    openTime = { hour: 8, minute: 0 };
    closeTime = { hour: 16, minute: 30 };
  } else if (marketName === 'Japan') {
    timezone = 'Asia/Tokyo';
    openTime = { hour: 9, minute: 0 };
    closeTime = { hour: 15, minute: 0 };
  }

  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric',
      hour12: false
    });
    const parts = formatter.formatToParts(now);
    const dt = {};
    parts.forEach(p => { dt[p.type] = p.value; });

    const weekdayFormatter = new Intl.DateTimeFormat('en-US', { timeZone: timezone, weekday: 'short' });
    const weekdayStr = weekdayFormatter.format(now);
    const isWeekend = weekdayStr === 'Sat' || weekdayStr === 'Sun';

    if (isWeekend) return 'Closed';

    const hourVal = parseInt(dt.hour);
    const minVal = parseInt(dt.minute);

    const currentMin = hourVal * 60 + minVal;
    const startMin = openTime.hour * 60 + openTime.minute;
    const endMin = closeTime.hour * 60 + closeTime.minute;

    if (currentMin >= startMin && currentMin < endMin) {
      return 'Open';
    }
    return 'Closed';
  } catch (e) {
    const day = now.getDay();
    if (day === 0 || day === 6) return 'Closed';
    const hour = now.getHours();
    if (hour >= 9 && hour < 16) return 'Open';
    return 'Closed';
  }
};

export default function Dashboard() {
  const { currentStock, isLoading, selectedStockSymbol, setSelectedStockSymbol, dbConnected } = useStockData();
  const { 
    allStocks, 
    fetchStockHistory, 
    fetchStockNews,
    alerts,
    createAlert,
    deleteAlert,
    notifications,
    clearNotifications,
    markNotificationRead,
    indices,
    marketMovers,
    trendingStocks,
    marketSummary,
    toasts,
    removeToast
  } = useStock();
  const [predictionData, setPredictionData] = useState(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('market'); // 'market' or 'technical'
  
  // States for Smart Alert builder form
  const [alertSymbol, setAlertSymbol] = useState('');
  const [alertType, setAlertType] = useState('price_above');
  const [alertValue, setAlertValue] = useState('');
  const [creatingAlert, setCreatingAlert] = useState(false);

  const isFirstRender = React.useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (selectedStockSymbol) {
      setActiveTab('technical');
    }
  }, [selectedStockSymbol]);

  // Active time-series filter (TradingView style periods: 1D, 5D, 1M, 6M, 1Y, MAX)
  const [activeTimeframe, setActiveTimeframe] = useState('1Y');

  // Time-series history states
  const [chartHistory, setChartHistory] = useState([]);
  const [chartMeta, setChartMeta] = useState(null);
  const [chartLoading, setChartLoading] = useState(false);

  // Interactive History Table states
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historySortKey, setHistorySortKey] = useState('date');
  const [historySortDir, setHistorySortDir] = useState('desc');
  const [historyPage, setHistoryPage] = useState(1);
  const rowsPerPage = 5;

  const [stats, setStats] = useState({
    total: '1,408 Run Cycles',
    accuracy: '70.9%',
    bestStock: 'NVDA (75% Win)',
    successRate: '120 Wins / 30 Losses'
  });
  const [historyLogs, setHistoryLogs] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const symbol = currentStock?.symbol;

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        setPredictionLoading(true);
        const result = await predictStock(symbol);
        console.log("API RESPONSE:", result);
        setPredictionData(result);
      } catch (error) {
        console.log('Prediction Error:', error);
      } finally {
        setPredictionLoading(false);
      }
    };

    if (symbol) {
      fetchPrediction();
    }
  }, [symbol]);

  useEffect(() => {
    const loadHistory = async () => {
      if (!symbol) return;
      try {
        setChartLoading(true);
        const data = await fetchStockHistory(symbol, activeTimeframe);
        if (data) {
          setChartHistory(data.history || []);
          setChartMeta(data.meta || null);
        }
      } catch (err) {
        console.error("Error loading stock history:", err);
      } finally {
        setChartLoading(false);
      }
    };
    loadHistory();
  }, [symbol, activeTimeframe]);

  useEffect(() => {
    const loadNews = async () => {
      if (!symbol) return;
      try {
        setNewsLoading(true);
        const data = await fetchStockNews(symbol);
        if (data) {
          setNews(data);
        } else {
          setNews([]);
        }
      } catch (err) {
        console.error("Error loading stock news:", err);
        setNews([]);
      } finally {
        setNewsLoading(false);
      }
    };
    loadNews();
  }, [symbol]);

  useEffect(() => {
    const fetchStatsAndLogs = async () => {
      if (!symbol) return;
      try {
        const statsRes = await api.get('/history/stats', {
          params: { symbol }
        });
        setStats(statsRes.data);
      } catch (err) {
        console.error('Failed to load history metrics in dashboard:', err);
      }

      try {
        setHistoryLoading(true);
        const logsRes = await api.get('/history', {
          params: {
            limit: 50 // Fetch enough logs for client-side filtering/pagination
          }
        });

        const mappedLogs = (logsRes.data.logs || []).map(log => ({
          stock: log.symbol,
          prediction: log.prediction === 'BUY' ? 'BUY 📈' : log.prediction === 'SELL' ? 'SELL 📉' : 'HOLD ⏳',
          confidence: `${log.confidence}%`,
          outcome: log.status === 'Complied' ? 'WIN' : 'LOSS',
          date: new Date(log.createdAt || log.date).toISOString().slice(0, 10)
        }));

        setHistoryLogs(mappedLogs);
      } catch (err) {
        console.error('Failed to query dashboard history logs:', err);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchStatsAndLogs();
  }, [symbol, predictionData]);

  // Filter, sort and paginate prediction logs
  const processedLogs = useMemo(() => {
    let result = [...historyLogs];

    // Search filter
    if (historySearchQuery) {
      result = result.filter(log => log.stock.toLowerCase().includes(historySearchQuery.toLowerCase()));
    }

    // Sort
    result.sort((a, b) => {
      let valA = a[historySortKey];
      let valB = b[historySortKey];

      if (valA < valB) return historySortDir === 'asc' ? -1 : 1;
      if (valA > valB) return historySortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [historyLogs, historySearchQuery, historySortKey, historySortDir]);

  const totalPages = Math.ceil(processedLogs.length / rowsPerPage) || 1;
  const paginatedLogs = processedLogs.slice((historyPage - 1) * rowsPerPage, historyPage * rowsPerPage);

  const handleSort = (key) => {
    if (historySortKey === key) {
      setHistorySortDir(historySortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setHistorySortKey(key);
      setHistorySortDir('desc');
    }
    setHistoryPage(1);
  };

  // News Sentiment Stats computed from actual fetched articles
  const newsSentimentStats = useMemo(() => {
    if (!news || news.length === 0) {
      return { positive: 0, negative: 0, neutral: 0, total: 0 };
    }
    let pos = 0, neg = 0, neu = 0;
    news.forEach(item => {
      const s = item.sentiment ? item.sentiment.toLowerCase() : '';
      if (s === 'positive') pos++;
      else if (s === 'negative') neg++;
      else neu++;
    });
    const total = news.length;
    return {
      positive: Math.round((pos / total) * 100),
      negative: Math.round((neg / total) * 100),
      neutral: Math.round((neu / total) * 100),
      total
    };
  }, [news]);

  const displaySentiment = useMemo(() => {
    if (news && news.length > 0) {
      return {
        positive: newsSentimentStats.positive,
        negative: newsSentimentStats.negative,
        neutral: newsSentimentStats.neutral,
        explanation: `Based on AI sentiment analysis of ${news.length} recent financial news articles and company headlines for ${symbol || 'this asset'}.`
      };
    }
    return {
      positive: currentStock?.sentiment?.positive || 50,
      negative: currentStock?.sentiment?.negative || 20,
      neutral: currentStock?.sentiment?.neutral || 30,
      explanation: currentStock?.sentiment?.explanation || 'Market news sentiment currently neutral.'
    };
  }, [news, newsSentimentStats, currentStock?.sentiment, symbol]);

  // Early return after all hooks are declared
  if (isLoading || !currentStock) {
    return <DashboardSkeleton />;
  }

  const { name, price, change, changePercent, high, low, open, volume, marketCap, peRatio, dividendYield, chartData, technicals, sentiment, aiPrediction } = currentStock;
  const isUp = change >= 0;

  // Selected Stock chart timeframe points
  const activeChartData = chartData[activeTimeframe] || chartData['1W'];

  const activePrediction = predictionData ? {
    prediction: predictionData.prediction,
    confidence: predictionData.confidence,
    direction: predictionData.direction?.toLowerCase() || 'neutral',
    recommendation: predictionData.recommendation || (predictionData.prediction === 'BUY' ? 'Strong Buy' : predictionData.prediction === 'SELL' ? 'Strong Sell' : 'Hold'),
    strength: predictionData.strength || (predictionData.confidence > 80 ? 'High' : predictionData.confidence > 60 ? 'Moderate' : 'Low'),
    ticker: predictionData.symbol || symbol,
    reasoning: predictionData.reasoning
  } : {
    prediction: aiPrediction.recommendation.toUpperCase().includes('BUY') ? 'BUY' : aiPrediction.recommendation.toUpperCase().includes('SELL') ? 'SELL' : 'HOLD',
    confidence: aiPrediction.confidence,
    direction: aiPrediction.direction,
    recommendation: aiPrediction.recommendation,
    strength: aiPrediction.strength,
    ticker: symbol,
    reasoning: aiPrediction.reasoning
  };

  const predConfig = {
    text: activePrediction.prediction === 'BUY' ? 'text-neon-emerald' : activePrediction.prediction === 'SELL' ? 'text-neon-rose' : 'text-amber-400',
    bg: activePrediction.prediction === 'BUY' ? 'border-neon-emerald/20 shadow-neon-emerald/5' : activePrediction.prediction === 'SELL' ? 'border-neon-rose/20 shadow-neon-rose/5' : 'border-amber-500/20 shadow-amber-500/5',
    stroke: activePrediction.prediction === 'BUY' ? 'stroke-neon-emerald' : activePrediction.prediction === 'SELL' ? 'stroke-neon-rose' : 'stroke-amber-500',
    tag: activePrediction.prediction
  };

  const activeTechnicals = predictionData?.technicals || technicals;
  const activeSentiment = predictionData?.sentiment || sentiment;

  // Global Stat Cards Data
  const sentimentDir = activePrediction.prediction;
  const statsCards = [
    {
      id: 'sentiment',
      name: 'Market Sentiment',
      value: sentimentDir === 'BUY' ? 'BULLISH' : sentimentDir === 'SELL' ? 'BEARISH' : 'NEUTRAL',
      badge: sentimentDir === 'BUY' ? '↑ Long Bias' : sentimentDir === 'SELL' ? '↓ Short Bias' : '⏳ Sideways',
      desc: `Consensus: ${activePrediction.recommendation}`,
      secondary: { label: 'Signal Strength', value: activePrediction.strength },
      glowColor: sentimentDir === 'BUY' ? 'rgba(0,255,102,0.18)' : sentimentDir === 'SELL' ? 'rgba(255,45,85,0.18)' : 'rgba(245,158,11,0.18)',
      accentBar: sentimentDir === 'BUY' ? 'from-neon-emerald/60 via-neon-emerald/30' : sentimentDir === 'SELL' ? 'from-neon-rose/60 via-neon-rose/30' : 'from-amber-400/60 via-amber-400/30',
      borderHover: sentimentDir === 'BUY' ? 'hover:border-neon-emerald/40' : sentimentDir === 'SELL' ? 'hover:border-neon-rose/40' : 'hover:border-amber-400/40',
      color: sentimentDir === 'BUY' ? 'text-neon-emerald' : sentimentDir === 'SELL' ? 'text-neon-rose' : 'text-amber-400',
      strokeColor: sentimentDir === 'BUY' ? '#00ff66' : sentimentDir === 'SELL' ? '#ff2d55' : '#f59e0b',
      border: sentimentDir === 'BUY' ? 'border-neon-emerald/20' : sentimentDir === 'SELL' ? 'border-neon-rose/20' : 'border-amber-500/20',
      sparkline: [40, 50, 45, 60, 68],
      icon: FiTrendingUp,
    },
    {
      id: 'accuracy',
      name: 'Prediction Accuracy',
      value: stats.accuracy || '70.9%',
      badge: 'Historical Accuracy',
      desc: stats.successRate || '120 Wins / 30 Losses',
      secondary: { label: 'Live Confidence', value: predictionLoading ? '...' : `${activePrediction.confidence}%` },
      glowColor: 'rgba(0,240,255,0.14)',
      accentBar: 'from-neon-cyan/60 via-neon-cyan/30',
      borderHover: 'hover:border-neon-cyan/40',
      color: 'text-neon-cyan',
      strokeColor: '#00f0ff',
      border: 'border-neon-cyan/20',
      sparkline: [68, 69.5, 68.8, 70.1, 70.9],
      icon: FiTarget,
    },
    {
      id: 'confidence',
      name: 'AI Confidence',
      value: predictionLoading ? '...' : `${activePrediction.confidence}%`,
      badge: `${activePrediction.strength} Signal`,
      desc: `Direction: ${activePrediction.direction}`,
      secondary: { label: 'Model', value: 'Random Forest' },
      glowColor: 'rgba(188,52,250,0.14)',
      accentBar: 'from-neon-purple/60 via-neon-purple/30',
      borderHover: 'hover:border-neon-purple/40',
      color: 'text-neon-purple',
      strokeColor: '#bc34fa',
      border: 'border-neon-purple/20',
      sparkline: [80, 85, 82, 88, 91],
      icon: FiCpu,
    },
    {
      id: 'cycles',
      name: 'Run Cycles',
      value: stats.total || '1,408',
      badge: 'Total Processed',
      desc: `Best: ${stats.bestStock || 'NVDA (75% Win)'}`,
      secondary: { label: 'Tracked', value: `${allStocks.length} Assets` },
      glowColor: 'rgba(71,85,105,0.18)',
      accentBar: 'from-slate-500/50 via-slate-500/20',
      borderHover: 'hover:border-slate-600/60',
      color: 'text-slate-200',
      strokeColor: '#64748b',
      border: 'border-slate-800/80',
      sparkline: [22, 24, 23, 25, 25],
      icon: FiAward,
    }
  ];

  // News Sentiment Pie Chart data
  const pieData = [
    { name: 'Positive', value: activeSentiment.positive, color: '#00ff66' },
    { name: 'Negative', value: activeSentiment.negative, color: '#ff2d55' },
    { name: 'Neutral', value: activeSentiment.neutral, color: '#bc34fa' }
  ];

  // SVG Custom Candlestick rendering logic
  const CandlestickBar = (props) => {
    const { x, y, width, height, open, close, high, low } = props;
    const isUpBar = close >= open;
    const color = isUpBar ? '#00ff66' : '#ff2d55';
    const glowId = `glow-${isUpBar ? 'bull' : 'bear'}`;
    const wickTop = Math.min(y, y + height);
    const wickBottom = Math.max(y, y + height);
    return (
      <g>
        <defs>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {/* Wick */}
        <line
          x1={x + width / 2} y1={wickTop - 8}
          x2={x + width / 2} y2={wickBottom + 8}
          stroke={color} strokeWidth={1.2} strokeOpacity={0.7}
        />
        {/* Body with glow */}
        <rect
          x={x} y={y} width={width} height={Math.max(height, 2)}
          fill={color} fillOpacity={0.85} stroke={color} strokeWidth={0.5}
          rx="1.5" filter={`url(#${glowId})`}
        />
      </g>
    );
  };

  const radius = 40;

  const circumference =
    2 * Math.PI * radius;

  const strokeDashoffset =
    circumference - (activePrediction.confidence / 100) * circumference;

  return (
    <div className="space-y-6 relative z-10 text-slate-100 font-sans">

      {/* ── Premium Dashboard Hero Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-50"
      >
        {/* Glassmorphic card */}
        <div className="glass-card rounded-2xl px-6 py-5 sm:px-8 sm:py-6 relative z-10 border border-slate-800/60">

          {/* Subtle top glow bar */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-neon-cyan/60 to-transparent" />

          {/* Animated background grid + radial glow */}
          <div className="absolute inset-0 grid-mesh opacity-20 pointer-events-none rounded-2xl" />
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-neon-cyan/4 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-10 w-48 h-48 bg-neon-purple/4 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">

            {/* ── Left: Title block ── */}
            <div className="flex flex-col gap-3">

              {/* Status badges row */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.45 }}
                className="flex flex-wrap items-center gap-2"
              >
                {/* Live Market badge */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-neon-emerald/8 text-neon-emerald border border-neon-emerald/25 shadow-[0_0_14px_rgba(0,255,102,0.12)] backdrop-blur-sm">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-emerald opacity-70" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-neon-emerald" />
                  </span>
                  Live Market
                </span>

                {/* AI Model Active badge with dynamic accuracy */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-neon-cyan/8 text-neon-cyan border border-neon-cyan/25 shadow-[0_0_14px_rgba(0,240,255,0.10)] backdrop-blur-sm">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-70" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-neon-cyan" />
                  </span>
                  AI Model Active · <span className="text-neon-emerald ml-0.5">{stats.accuracy || '70.9%'}</span>
                </span>

                {/* DB connection mode badge */}
                {dbConnected ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-900/60 text-slate-400 border border-slate-800/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-emerald" />
                    Live Atlas
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-500/8 text-amber-400 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.10)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Sandbox Mode
                  </span>
                )}
              </motion.div>

              {/* Main Title */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.5 }}
              >
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-slate-100 leading-none font-mono">
                  AI{' '}
                  <span className="bg-gradient-to-r from-neon-cyan via-neon-cyan to-neon-purple bg-clip-text text-transparent">
                    Market
                  </span>{' '}
                  Intelligence
                </h1>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold uppercase tracking-[0.2em] font-mono mt-2">
                  Neural forecasting terminal
                  <span className="mx-2 text-slate-700">//</span>
                  <span className="text-neon-cyan/70">Sigma v1.2</span>
                  <span className="mx-2 text-slate-700">//</span>
                  <span className="text-slate-600">Random Forest + Sentiment</span>
                </p>
              </motion.div>
            </div>

            {/* ── Right: Stock Search ── */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full lg:w-auto lg:min-w-[340px]"
            >
              <StockSearch />
            </motion.div>
          </div>
        </div>
      </motion.div>
      <div className="flex items-center gap-4 bg-slate-950/40 border border-slate-900/50 p-1.5 rounded-xl self-start w-fit relative z-40">
        <button
          onClick={() => setActiveTab('market')}
          className={`px-4 py-2 rounded-lg font-mono text-[9px] font-black uppercase tracking-widest transition-all duration-200 cursor-pointer ${
            activeTab === 'market'
              ? 'bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan shadow-[0_0_12px_rgba(0,240,255,0.15)]'
              : 'bg-transparent text-slate-500 hover:text-slate-350 border border-transparent'
          }`}
        >
          📈 Market Terminal
        </button>
        <button
          onClick={() => setActiveTab('technical')}
          className={`px-4 py-2 rounded-lg font-mono text-[9px] font-black uppercase tracking-widest transition-all duration-200 cursor-pointer ${
            activeTab === 'technical'
              ? 'bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan shadow-[0_0_12px_rgba(0,240,255,0.15)]'
              : 'bg-transparent text-slate-500 hover:text-slate-350 border border-transparent'
          }`}
        >
          📊 Technical Terminal ({symbol})
        </button>
      </div>

      {activeTab === 'market' ? (
        <div className="space-y-6">
          {/* Live Market Indices Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {indices.map((idx, i) => {
              const isUpIdx = idx.change >= 0;
              const accentColor = isUpIdx ? '#00ff66' : '#ff2d55';
              const pts = idx.sparkline || [idx.value];
              const max = Math.max(...pts);
              const min = Math.min(...pts);
              const norm = pts.map(v => min === max ? 10 : ((v - min) / (max - min)) * 14 + 3);
              const sparkPath = `M 0 ${(18 - norm[0]).toFixed(1)} L 15 ${(18 - norm[1]).toFixed(1)} L 30 ${(18 - norm[2]).toFixed(1)} L 45 ${(18 - norm[3]).toFixed(1)} L 60 ${(18 - norm[4]).toFixed(1)} L 75 ${(18 - norm[5]).toFixed(1)}`;
              
              return (
                <motion.div
                  key={idx.symbol}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={`glass-card rounded-2xl p-4 flex flex-col justify-between border relative overflow-hidden group transition-all duration-300 ${
                    isUpIdx ? 'border-neon-emerald/10 hover:border-neon-emerald/30 shadow-[0_4px_20px_rgba(0,255,102,0.04)]' : 'border-neon-rose/10 hover:border-neon-rose/30 shadow-[0_4px_20px_rgba(255,45,85,0.04)]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2 font-mono">
                    <span className="text-[10px] font-black text-slate-100">{idx.name}</span>
                    <span className="text-[7.5px] font-bold text-slate-500 uppercase tracking-widest">{idx.type}</span>
                  </div>
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-sm font-black font-mono tracking-tight text-slate-150">
                      {idx.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <span className={`text-[8.5px] font-black font-mono tracking-tight flex items-center gap-0.5 ${isUpIdx ? 'text-neon-emerald' : 'text-neon-rose'}`}>
                      {isUpIdx ? '▲' : '▼'} {Math.abs(idx.changePercent).toFixed(2)}%
                    </span>
                  </div>
                  
                  {/* Micro Sparkline in bottom section of card */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-900/50">
                    <span className={`text-[8px] font-mono ${isUpIdx ? 'text-neon-emerald/70' : 'text-neon-rose/70'}`}>
                      {isUpIdx ? `+${idx.change.toFixed(2)}` : `${idx.change.toFixed(2)}`}
                    </span>
                    <div className="w-16 h-6">
                      <svg viewBox="0 0 75 20" className="w-full h-full" preserveAspectRatio="none">
                        <path d={sparkPath} fill="none" stroke={accentColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* AI Market Summary & Smart Alerts Creator */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* AI Daily Summary Card */}
            <div className="lg:col-span-2 glass-card rounded-2xl p-5 border border-slate-800/60 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent" />
              <div>
                <div className="flex justify-between items-center mb-4 border-b border-slate-900/50 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-neon-cyan">
                      <FiCpu className="w-3.5 h-3.5" />
                    </div>
                    <div className="font-mono">
                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Neural Insights</p>
                      <h4 className="text-[10px] font-black text-slate-100 tracking-wider uppercase mt-0.5">AI Market Summary</h4>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    marketSummary.sentiment.includes('Positive') 
                      ? 'bg-neon-emerald/8 text-neon-emerald border-neon-emerald/20 shadow-[0_0_10px_rgba(0,255,102,0.08)]' 
                      : 'bg-neon-rose/8 text-neon-rose border-neon-rose/20 shadow-[0_0_10px_rgba(255,45,85,0.08)]'
                  }`}>
                    🟢 {marketSummary.sentiment}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium leading-relaxed font-sans pr-2">
                  "{marketSummary.summary}"
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-900/40 font-mono text-[7.5px] uppercase tracking-widest text-slate-550 flex justify-between">
                <span>Inference Period: DAILY CYCLES</span>
                <span className="text-neon-cyan">UPDATED REAL-TIME</span>
              </div>
            </div>

            {/* Smart Alerts Builder Card */}
            <div className="glass-card rounded-2xl p-5 border border-slate-800/60 relative overflow-hidden flex flex-col">
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-neon-purple/30 to-transparent" />
              <div className="flex items-center gap-2.5 mb-4 border-b border-slate-900/50 pb-3">
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-neon-purple">
                  <FiAlertTriangle className="w-3.5 h-3.5" />
                </div>
                <div className="font-mono">
                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Smart Alerts</p>
                  <h4 className="text-[10px] font-black text-slate-100 tracking-wider uppercase mt-0.5">Alert Configuration</h4>
                </div>
              </div>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!alertSymbol || !alertValue) return;
                try {
                  setCreatingAlert(true);
                  await createAlert({
                    symbol: alertSymbol,
                    type: alertType,
                    value: alertValue
                  });
                  setAlertSymbol('');
                  setAlertValue('');
                } catch (err) {
                  console.error(err);
                } finally {
                  setCreatingAlert(false);
                }
              }} className="space-y-3 font-mono text-[9px]">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-500 font-black uppercase tracking-widest mb-1.5 block">Asset Ticker</label>
                    <input 
                      type="text" 
                      placeholder="e.g. RELIANCE.NS" 
                      value={alertSymbol} 
                      onChange={(e) => setAlertSymbol(e.target.value.toUpperCase())}
                      className="w-full bg-slate-950/80 border border-slate-800 p-2 rounded-lg text-slate-200 focus:outline-none focus:border-neon-purple/50 uppercase" 
                      required
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 font-black uppercase tracking-widest mb-1.5 block">Alert Parameter</label>
                    <select 
                      value={alertType} 
                      onChange={(e) => setAlertType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 p-2 rounded-lg text-slate-200 focus:outline-none focus:border-neon-purple/50 cursor-pointer"
                    >
                      <option value="price_above">Price Above</option>
                      <option value="price_below">Price Below</option>
                      <option value="rsi_above">RSI &gt; Threshold</option>
                      <option value="rsi_below">RSI &lt; Threshold</option>
                      <option value="signal_change">AI Signal Type</option>
                      <option value="sentiment_negative">Neg Sentiment &gt;</option>
                      <option value="volatility_above">Volatility &gt; %</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-slate-500 font-black uppercase tracking-widest mb-1.5 block">Trigger Value / Signal</label>
                  <input 
                    type="text" 
                    placeholder={alertType === 'signal_change' ? 'e.g. BUY, SELL' : 'e.g. 1500.50, 70, 30'} 
                    value={alertValue} 
                    onChange={(e) => setAlertValue(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 p-2 rounded-lg text-slate-200 focus:outline-none focus:border-neon-purple/50" 
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={creatingAlert}
                  className="w-full py-2 bg-gradient-to-r from-neon-purple to-neon-purple/80 hover:opacity-90 disabled:opacity-50 text-slate-950 rounded-lg font-black tracking-widest uppercase text-[9px] transition-all duration-200 cursor-pointer"
                >
                  {creatingAlert ? 'Establishing Alert...' : 'Activate Smart Alert'}
                </button>
              </form>
            </div>
          </div>

          {/* Movers, Watchlist & Trending grid layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Movers and Trending */}
            <div className="lg:col-span-2 space-y-6">
              {/* Movers */}
              <div className="glass-card rounded-2xl p-5 border border-slate-800/60 relative overflow-hidden flex flex-col">
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent" />
                <div className="flex items-center justify-between border-b border-slate-900/50 pb-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-neon-cyan">
                      <FiZap className="w-3.5 h-3.5" />
                    </div>
                    <div className="font-mono">
                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Active Movers</p>
                      <h4 className="text-[10px] font-black text-slate-100 tracking-wider uppercase mt-0.5">Top Gainers & Losers</h4>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-[9px]">
                  {/* Gainers */}
                  <div>
                    <h5 className="text-neon-emerald font-black uppercase tracking-widest text-[9px] mb-3 flex items-center gap-1">
                      📈 Top Gainers
                    </h5>
                    <div className="space-y-2.5">
                      {[...(marketMovers.india?.gainers || []), ...(marketMovers.usa?.gainers || [])].map((stock) => (
                        <div 
                          key={`${stock.ticker}-gain`} 
                          onClick={() => setSelectedStockSymbol(stock.ticker)}
                          className="p-3 bg-slate-950/60 border border-slate-900 rounded-xl flex items-center justify-between hover:border-slate-800 hover:bg-slate-900/40 cursor-pointer transition-all duration-205"
                        >
                          <div>
                            <span className="font-black text-slate-100 block">{stock.ticker}</span>
                            <span className="text-[7.5px] text-slate-500 font-sans block truncate max-w-[130px] font-semibold mt-0.5">{stock.company}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-slate-200 block">{stock.price.toFixed(2)}</span>
                            <span className="text-neon-emerald font-black block text-[8px] mt-0.5">+{stock.changePercent.toFixed(2)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Losers */}
                  <div>
                    <h5 className="text-neon-rose font-black uppercase tracking-widest text-[9px] mb-3 flex items-center gap-1">
                      📉 Top Losers
                    </h5>
                    <div className="space-y-2.5">
                      {[...(marketMovers.india?.losers || []), ...(marketMovers.usa?.losers || [])].map((stock) => (
                        <div 
                          key={`${stock.ticker}-lose`} 
                          onClick={() => setSelectedStockSymbol(stock.ticker)}
                          className="p-3 bg-slate-950/60 border border-slate-900 rounded-xl flex items-center justify-between hover:border-slate-800 hover:bg-slate-900/40 cursor-pointer transition-all duration-205"
                        >
                          <div>
                            <span className="font-black text-slate-100 block">{stock.ticker}</span>
                            <span className="text-[7.5px] text-slate-500 font-sans block truncate max-w-[130px] font-semibold mt-0.5">{stock.company}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-slate-200 block">{stock.price.toFixed(2)}</span>
                            <span className="text-neon-rose font-black block text-[8px] mt-0.5">{stock.changePercent.toFixed(2)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Trending Stocks */}
              <div className="glass-card rounded-2xl p-5 border border-slate-800/60 relative overflow-hidden flex flex-col">
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent" />
                <div className="flex items-center gap-2.5 border-b border-slate-900/50 pb-3 mb-4">
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-neon-cyan">
                    <FiTrendingUp className="w-3.5 h-3.5" />
                  </div>
                  <div className="font-mono">
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Social Telemetry</p>
                    <h4 className="text-[10px] font-black text-slate-100 tracking-wider uppercase mt-0.5">Trending Stocks</h4>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-[9px]">
                  {[...(trendingStocks.india || []), ...(trendingStocks.usa || [])].map((item) => (
                    <div 
                      key={`${item.ticker}-trend`}
                      onClick={() => setSelectedStockSymbol(item.ticker)}
                      className="p-3 bg-slate-950/40 border border-slate-900/80 rounded-xl flex items-center justify-between hover:bg-slate-900/40 hover:border-slate-800 cursor-pointer transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[9px] bg-gradient-to-br ${getLogoClass(item.ticker)} shrink-0 font-mono`}>
                          {item.ticker.replace('.NS', '').slice(0, 2)}
                        </div>
                        <div>
                          <span className="font-black text-slate-200 block">{item.ticker}</span>
                          <span className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-[6.5px] font-black text-neon-cyan uppercase mt-0.5 inline-block">
                            {item.trendBadge}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-550 text-[7px] uppercase block">Bull Score</span>
                        <span className="font-black text-neon-emerald block">{item.bullishScore}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Watchlist */}
            <div className="space-y-6">
              <Watchlist />
            </div>
          </div>

          {/* Active Alerts Table & Notification Center log */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active alerts */}
            <div className="lg:col-span-2 glass-card rounded-2xl p-5 border border-slate-800/60 relative overflow-hidden flex flex-col">
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent" />
              <div className="flex items-center justify-between border-b border-slate-900/50 pb-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-neon-cyan">
                    <FiBookmark className="w-3.5 h-3.5" />
                  </div>
                  <div className="font-mono">
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Active System Triggers</p>
                    <h4 className="text-[10px] font-black text-slate-100 tracking-wider uppercase mt-0.5">Active Alerts ({alerts.length})</h4>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-[9px] border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-slate-900/60 text-slate-550 font-black uppercase tracking-widest">
                      <th className="py-2.5 px-3">Asset</th>
                      <th className="py-2.5 px-3">Trigger Condition</th>
                      <th className="py-2.5 px-3">Threshold Value</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/40">
                    {alerts.map(alert => (
                      <tr key={alert._id} className="hover:bg-slate-900/25 transition-colors">
                        <td className="py-2.5 px-3 font-black text-slate-150">{alert.symbol}</td>
                        <td className="py-2.5 px-3 text-slate-400 capitalize">{alert.type.replace('_', ' ')}</td>
                        <td className="py-2.5 px-3 text-neon-cyan font-black">{alert.value}</td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => deleteAlert(alert._id)}
                            className="p-1 rounded bg-slate-950 border border-slate-850 text-slate-500 hover:text-neon-rose hover:border-neon-rose/40 cursor-pointer"
                          >
                            <FiTrash2 className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {alerts.length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-center py-6 text-[8.5px] uppercase font-black text-slate-600 tracking-widest font-mono">
                          No Active Alerts Configured
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notification logs */}
            <div className="glass-card rounded-2xl p-5 border border-slate-800/60 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent" />
              <div>
                <div className="flex items-center justify-between border-b border-slate-900/50 pb-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-neon-cyan">
                      <FiActivity className="w-3.5 h-3.5" />
                    </div>
                    <div className="font-mono">
                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Event Telemetry</p>
                      <h4 className="text-[10px] font-black text-slate-100 tracking-wider uppercase mt-0.5">Notification Center</h4>
                    </div>
                  </div>
                  
                  {notifications.length > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="px-2 py-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 font-mono text-[7px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="space-y-2 overflow-y-auto max-h-56 pr-1 custom-scrollbar">
                  {notifications.map(notif => (
                    <div 
                      key={notif._id}
                      onClick={() => markNotificationRead(notif._id)}
                      className={`p-2.5 rounded-xl border font-mono text-[8px] transition-all duration-200 ${
                        notif.isRead 
                          ? 'bg-slate-955/20 border-slate-900/40 text-slate-500' 
                          : 'bg-slate-900/70 border-slate-805 text-slate-200 hover:border-slate-700 shadow-sm cursor-pointer'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-black uppercase tracking-wider block">{notif.title}</span>
                        {!notif.isRead && <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan block" style={{ boxShadow: '0 0 6px #00f0ff' }} />}
                      </div>
                      <p className="text-[9px] font-sans leading-relaxed text-slate-450 font-semibold">{notif.message}</p>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <div className="text-center py-8 text-[8.5px] uppercase font-black tracking-widest text-slate-655 font-mono">
                      No Triggered Notifications
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Market Overview Section */}
          <div id="market">
            <MarketStats />
          </div>

          {/* ── Premium Statistics Widget Cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
            {statsCards.map((card, i) => {
              const Icon = card.icon;
              const pts = card.sparkline;
              const max = Math.max(...pts); const min = Math.min(...pts);
              const norm = pts.map(v => min === max ? 10 : ((v - min) / (max - min)) * 14 + 3);
              const sparkPath = `M 0 ${(18 - norm[0]).toFixed(1)} L 12.5 ${(18 - norm[1]).toFixed(1)} L 25 ${(18 - norm[2]).toFixed(1)} L 37.5 ${(18 - norm[3]).toFixed(1)} L 50 ${(18 - norm[4]).toFixed(1)}`;
              const areaPath = `${sparkPath} L 50 20 L 0 20 Z`;
              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -4, transition: { duration: 0.25 } }}
                  className={`glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden group border ${card.border} ${card.borderHover} transition-colors duration-300`}
                  style={{
                    boxShadow: `0 4px 24px -4px ${card.glowColor}, 0 1px 8px -2px rgba(0,0,0,0.4)`
                  }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"
                    style={{ background: `radial-gradient(ellipse at top left, ${card.glowColor} 0%, transparent 65%)` }} />
                  <div className={`absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r ${card.accentBar} to-transparent`} />
                  <div className="absolute top-3 right-3 w-1 h-1 rounded-full opacity-65" style={{ background: card.strokeColor, boxShadow: `0 0 6px ${card.strokeColor}` }} />
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-xl border" style={{ background: `${card.glowColor}`, borderColor: `${card.strokeColor}33` }}>
                      <Icon className="w-3.5 h-3.5" style={{ color: card.strokeColor }} />
                    </div>
                    <span className="text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border font-mono"
                      style={{ color: card.strokeColor, borderColor: `${card.strokeColor}40`, background: `${card.strokeColor}12` }}>
                      {card.badge}
                    </span>
                  </div>
                  <div className="mb-1">
                    <span className="text-[9px] font-black text-slate-550 uppercase tracking-[0.18em] font-mono block mb-1.5">{card.name}</span>
                    <span className={`text-lg sm:text-xl font-black font-mono tracking-tight block leading-none ${card.color}`}>{card.value}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 mb-3">
                    <div>
                      <span className="text-[7px] text-slate-655 font-black uppercase tracking-widest font-mono block">{card.secondary.label}</span>
                      <span className="text-[10px] font-black text-slate-350 font-mono mt-0.5 block">{card.secondary.value}</span>
                    </div>
                    <div className="w-16 h-8">
                      <svg viewBox="0 0 50 20" className="w-full h-full" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id={`sg-${card.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={card.strokeColor} stopOpacity="0.35" />
                            <stop offset="100%" stopColor={card.strokeColor} stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path d={areaPath} fill={`url(#sg-${card.id})`} />
                        <path d={sparkPath} fill="none" stroke={card.strokeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                  <div className="border-t pt-2.5" style={{ borderColor: `${card.strokeColor}18` }}>
                    <span className="text-[8px] text-slate-500 font-mono tracking-wide leading-relaxed">{card.desc}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Main Grid: Charts, technicals, and right columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left main columns (Charts, technicals, sentiment, logs) */}
        <div className="lg:col-span-2 space-y-6">

          {/* ── Premium Stock Chart Section ── */}
          {(() => {
            const isBullishTrend = chartHistory.length >= 2 
              ? chartHistory[chartHistory.length - 1].close >= chartHistory[0].close 
              : isUp;
            const strokeColor = isBullishTrend ? '#00ff66' : '#ff2d55';

            return (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                className="relative rounded-2xl overflow-hidden"
                style={{ 
                  boxShadow: `0 8px 40px -8px ${isBullishTrend ? 'rgba(0,255,102,0.10)' : 'rgba(255,45,85,0.10)'}, 0 2px 16px -4px rgba(0,0,0,0.5)` 
                }}
              >
                {/* Outer glow border */}
                <div className="absolute inset-0 rounded-2xl pointer-events-none z-0"
                  style={{ boxShadow: `inset 0 0 0 1px ${isBullishTrend ? 'rgba(0,255,102,0.14)' : 'rgba(255,45,85,0.14)'}` }}
                />

                <div className="glass-card rounded-2xl relative z-10 overflow-hidden border border-slate-800/50">

                  {/* Top gradient accent bar */}
                  <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent ${isBullishTrend ? 'via-neon-emerald/70' : 'via-neon-rose/70'} to-transparent`} />

                  {/* Ambient background glow */}
                  <div className={`absolute top-0 right-0 w-64 h-48 rounded-full blur-3xl pointer-events-none opacity-30 ${isBullishTrend ? 'bg-neon-emerald/6' : 'bg-neon-rose/6'}`} />

                  {/* ── Chart Header (Improved Showcase Card) ── */}
                  <div className="px-5 sm:px-6 pt-5 pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">

                      {/* Left: Stock Identity with Logo + Price */}
                      <div className="flex items-start gap-4">
                        {/* Stylized Brand Logo Initials */}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xs bg-gradient-to-br ${getLogoClass(symbol)} shadow-lg border border-slate-700/30 shrink-0 font-mono tracking-wide select-none`}>
                          {symbol ? symbol.replace('.NS', '').replace('.BO', '').slice(0, 2).toUpperCase() : 'ST'}
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Symbol pill */}
                            <span className="text-xs font-black text-slate-100 font-mono tracking-widest bg-slate-900/80 border border-slate-800 px-3 py-1 rounded-lg">
                              {symbol}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-mono">
                              • {currentStock.exchange || 'NASDAQ'} ({currentStock.country || 'USA'}) {currentStock.countryFlag || '🇺🇸'}
                            </span>

                            {/* Market Status Badge */}
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest font-mono border ${getMarketStatus(currentStock.market) === 'Open'
                              ? 'bg-neon-emerald/10 text-neon-emerald border-neon-emerald/20 shadow-[0_0_8px_rgba(0,255,102,0.08)]'
                              : 'bg-slate-950 text-slate-500 border-slate-900'
                              }`}>
                              <span className={`w-1 h-1 rounded-full ${getMarketStatus(currentStock.market) === 'Open' ? 'bg-neon-emerald animate-pulse' : 'bg-slate-600'
                                }`} />
                              Market {getMarketStatus(currentStock.market)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-slate-400 font-semibold truncate block max-w-[150px] sm:max-w-none">{name}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Timeframe Selector */}
                      <div className="flex items-center gap-1 bg-slate-950/70 border border-slate-900/80 p-1 rounded-xl font-mono text-[9px] font-black shrink-0 self-start">
                        {['1D', '5D', '1M', '6M', '1Y', 'MAX'].map((tf) => (
                          <button
                            key={tf}
                            onClick={() => setActiveTimeframe(tf)}
                            className={`relative px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-250 tracking-widest ${activeTimeframe === tf
                              ? 'text-slate-950 font-black'
                              : 'text-slate-500 hover:text-slate-200'
                              }`}
                          >
                            {activeTimeframe === tf && (
                              <motion.span
                                layoutId="timeframeActive"
                                className={`absolute inset-0 rounded-lg ${isBullishTrend ? 'bg-neon-emerald' : 'bg-neon-rose'}`}
                                style={{ 
                                  boxShadow: isBullishTrend 
                                    ? '0 0 12px rgba(0,255,102,0.4)' 
                                    : '0 0 12px rgba(255,45,85,0.4)' 
                                }}
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                              />
                            )}
                            <span className="relative z-10">{tf}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* ── Top Metrics Strip ── */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5 pt-4 border-t border-slate-900/50 font-mono">
                      <div>
                        <span className="text-[7.5px] font-black text-slate-600 uppercase tracking-widest block mb-1">Last Price</span>
                        <span className={`text-sm sm:text-base font-black tracking-tight ${isBullishTrend ? 'text-neon-emerald' : 'text-neon-rose'}`}>
                          {chartMeta ? formatCurrency(chartMeta.currentPrice, currentStock.currency) : formatCurrency(price, currentStock.currency)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[7.5px] font-black text-slate-600 uppercase tracking-widest block mb-1">Period Change %</span>
                        <span className={`text-xs sm:text-sm font-black flex items-center gap-0.5 ${isBullishTrend ? 'text-neon-emerald' : 'text-neon-rose'}`}>
                          {isBullishTrend ? '▲' : '▼'} {chartMeta ? Math.abs(chartMeta.changePercent).toFixed(2) : '—'}%
                        </span>
                      </div>
                      <div>
                        <span className="text-[7.5px] font-black text-slate-600 uppercase tracking-widest block mb-1">52 Week High</span>
                        <span className="text-xs sm:text-sm font-black text-slate-200">
                          {chartMeta ? formatCurrency(chartMeta.fiftyTwoWeekHigh, currentStock.currency) : '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[7.5px] font-black text-slate-600 uppercase tracking-widest block mb-1">52 Week Low</span>
                        <span className="text-xs sm:text-sm font-black text-slate-200">
                          {chartMeta ? formatCurrency(chartMeta.fiftyTwoWeekLow, currentStock.currency) : '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[7.5px] font-black text-slate-600 uppercase tracking-widest block mb-1">Market Cap</span>
                        <span className="text-xs sm:text-sm font-black text-neon-purple">
                          {chartMeta?.marketCap ? formatVolume(chartMeta.marketCap) : '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ── Chart Body ── */}
                  <div className="px-5 pb-5 relative">
                    {chartLoading ? (
                      <div className="h-64 sm:h-80 w-full flex flex-col items-center justify-center bg-slate-950/20 rounded-xl border border-slate-900/40 relative overflow-hidden">
                        <div className="absolute inset-0 shimmer opacity-20" />
                        <div className="w-10 h-10 rounded-full border-2 border-neon-cyan/20 border-t-neon-cyan animate-spin mb-3" />
                        <span className="text-[10px] text-slate-550 uppercase tracking-widest font-black font-mono animate-pulse">Synchronizing Market Telemetry...</span>
                      </div>
                    ) : chartHistory.length === 0 ? (
                      <div className="h-64 sm:h-80 w-full flex flex-col items-center justify-center bg-slate-950/20 rounded-xl border border-slate-900/40 font-mono">
                        <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">No historical data available</span>
                      </div>
                    ) : (
                      <div className="h-64 sm:h-80 w-full font-mono text-[9px] font-bold">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartHistory} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                            <defs>
                              <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={strokeColor} stopOpacity={0.16} />
                                <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="1 5" stroke="#172030" vertical={false} />
                            <XAxis
                              dataKey="date" 
                              stroke="#334155" 
                              tick={{ fill: '#475569', fontSize: 9, fontFamily: 'JetBrains Mono' }}
                              tickLine={false} 
                              axisLine={{ stroke: '#1e293b' }}
                              tickFormatter={(v) => {
                                if (activeTimeframe === '1D' || activeTimeframe === '5D') {
                                  return v.split(' ')[1] || v;
                                }
                                return v.slice(5) || v; // show MM-DD
                              }}
                            />
                            <YAxis
                              stroke="#334155" 
                              tick={{ fill: '#475569', fontSize: 9, fontFamily: 'JetBrains Mono' }}
                              tickLine={false} 
                              axisLine={false} 
                              domain={['auto', 'auto']} 
                              width={54}
                              tickFormatter={(v) => v > 1000 ? `${(v / 1000).toFixed(0)}k` : v.toFixed(0)}
                            />
                            <Tooltip content={<PremiumTooltip isUp={isBullishTrend} currency={currentStock?.currency} />} cursor={{ stroke: '#334155', strokeWidth: 1, strokeDasharray: '4 4' }} />
                            <Area
                              type="monotone" 
                              dataKey="close" 
                              stroke={strokeColor} 
                              strokeWidth={2}
                              fill="url(#chartAreaGrad)"
                              dot={false}
                              activeDot={{ r: 4, stroke: strokeColor, strokeWidth: 2, fill: '#090d16' }}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })()}

          {/* ── Premium Technical Oscillators & Indicators ── */}
          {(() => {
            const techMap = {
              rsi: { icon: FiActivity, label: 'RSI (14)', interp: (v) => v > 70 ? 'Overbought zone — watch for reversal' : v < 30 ? 'Oversold — potential bounce incoming' : 'Healthy momentum, no extreme signal' },
              macd: { icon: FiTrendingUp, label: 'MACD', interp: (v) => v > 0 ? 'Positive crossover — bullish momentum trend' : 'Negative crossover — bearish pressure building' },
              momentum: { icon: FiArrowUpRight, label: 'Momentum', interp: (v) => v > 10 ? 'Strong upward price acceleration' : v < 0 ? 'Downward pressure dominant' : 'Moderate momentum building' },
              volatility: { icon: FiCompass, label: 'Volatility', interp: (v) => v > 30 ? 'Elevated risk — expect wider price swings' : v < 15 ? 'Low volatility — range-bound market' : 'Moderate volatility, normal trading range' },
              adx: { icon: FiTarget, label: 'ADX', interp: (v) => v > 40 ? 'Violent trend strength — high conviction' : v > 25 ? 'Strong trend — favorable for trend following' : 'Weak trend — choppy market conditions' },
              obv: { icon: FiAward, label: 'OBV', interp: (v) => v > 70 ? 'Accumulation phase — institutional buying' : v < 40 ? 'Distribution — selling pressure dominates' : 'Neutral flow — no clear institutional bias' },
            };

            const entries = Object.entries(activeTechnicals);
            const bullishCount = entries.filter(([, ind]) => ind.color.includes('emerald')).length;
            const bearishCount = entries.filter(([, ind]) => ind.color.includes('rose')).length;
            const outlook = bullishCount > bearishCount + 1 ? 'Strong Bullish Momentum'
              : bullishCount > bearishCount ? 'Moderate Bullish Bias'
                : bearishCount > bullishCount + 1 ? 'Weak Bearish Structure'
                  : bearishCount > bullishCount ? 'Moderate Bearish Pressure'
                    : 'Neutral Consolidation';
            const outlookColor = bullishCount > bearishCount ? '#00ff66' : bearishCount > bullishCount ? '#ff2d55' : '#f59e0b';

            return (
              <motion.div
                id="settings"
                key={symbol + '-tech'}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="glass-card rounded-2xl overflow-hidden relative"
                style={{ border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-neon-cyan/40 to-transparent" />

                {/* Header */}
                <div className="px-5 pt-5 pb-4 border-b border-slate-900/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-neon-cyan/8 border border-neon-cyan/20">
                        <FiActivity className="w-3.5 h-3.5 text-neon-cyan" />
                      </div>
                      <div className="font-mono">
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Quantitative Analysis</p>
                        <h3 className="text-[10px] font-black text-slate-100 uppercase tracking-wider mt-0.5">Technical Oscillators</h3>
                      </div>
                    </div>
                    {/* Technical Market Outlook badge */}
                    <span className="text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full font-mono"
                      style={{ color: outlookColor, background: outlookColor + '12', border: `1px solid ${outlookColor}30` }}>
                      {outlook}
                    </span>
                  </div>
                </div>

                {/* Indicator grid */}
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {entries.map(([key, ind]) => {
                    const meta = techMap[key] || { icon: FiActivity, label: key.toUpperCase(), interp: () => ind.status };
                    const Icon = meta.icon;
                    const sigColor = ind.color.includes('emerald') ? '#00ff66' : ind.color.includes('rose') ? '#ff2d55' : ind.color.includes('cyan') ? '#00f0ff' : '#f59e0b';
                    const sigBg = sigColor + '10';
                    const interp = meta.interp(ind.value);
                    return (
                      <motion.div
                        key={key}
                        whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
                        className="rounded-xl p-3.5 group transition-all duration-200"
                        style={{ background: 'rgba(255,255,255,0.025)', border: `1px solid rgba(255,255,255,0.05)` }}
                      >
                        {/* Top row: icon + name + value */}
                        <div className="flex items-center justify-between mb-2.5">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg" style={{ background: sigColor + '15', border: `1px solid ${sigColor}25` }}>
                              <Icon className="w-2.5 h-2.5" style={{ color: sigColor }} />
                            </div>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest font-mono">{meta.label}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-black font-mono" style={{ color: sigColor }}>{ind.value}</span>
                            <span className="text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded font-mono"
                              style={{ color: sigColor, background: sigBg }}>{ind.status}</span>
                          </div>
                        </div>

                        {/* Gradient progress bar */}
                        <div className="h-1 rounded-full overflow-hidden mb-2" style={{ background: 'rgba(255,255,255,0.05)' }}>
                          <motion.div
                            className="h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${ind.progress}%` }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            style={{ background: `linear-gradient(90deg, ${sigColor}60, ${sigColor})` }}
                          />
                        </div>

                        {/* AI Interpretation */}
                        <p className="text-[8px] text-slate-600 font-mono leading-relaxed">{interp}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })()}

          {/* ── Premium Model Input Telemetry ── */}
          {predictionData?.features && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="glass-card rounded-2xl p-5 relative overflow-hidden"
              style={{ border: '1px solid rgba(0, 240, 255, 0.15)', boxShadow: '0 8px 32px -8px rgba(0,240,255,0.08)' }}
            >
              {/* Scanline overlay */}
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(rgba(0,240,255,0.03) 1px, transparent 1px)', backgroundSize: '100% 4px' }} />
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-neon-cyan/50 to-transparent" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 border-b border-slate-900/60 pb-4 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-neon-cyan/10 border border-neon-cyan/25">
                    <FiCpu className="w-3.5 h-3.5 text-neon-cyan" />
                  </div>
                  <div className="font-mono">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Neural Network Feed</p>
                    <h3 className="text-[10px] font-black text-slate-100 uppercase tracking-wider mt-0.5">Model Input Telemetry</h3>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[7px] font-black uppercase tracking-widest font-mono"
                  style={{ background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.25)', color: '#00f0ff' }}>
                  <span className="w-1 h-1 rounded-full bg-neon-cyan animate-pulse" />
                  Random Forest Injected
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 relative z-10">
                {[
                  { label: 'Close Price', value: formatCurrency(predictionData.features.Close, currentStock?.currency), color: '#e2e8f0' },
                  { label: 'MA(5) Vector', value: formatCurrency(predictionData.features.MA5, currentStock?.currency), color: '#e2e8f0' },
                  { label: 'MA(20) Vector', value: formatCurrency(predictionData.features.MA20, currentStock?.currency), color: '#e2e8f0' },
                  { label: 'RSI (14-Day)', value: predictionData.features.RSI?.toFixed(1), color: predictionData.features.RSI > 65 ? '#ff2d55' : predictionData.features.RSI < 35 ? '#00ff66' : '#00f0ff' },
                  { label: 'MACD Line', value: predictionData.features.MACD?.toFixed(3), color: predictionData.features.MACD >= 0 ? '#00ff66' : '#ff2d55' },
                  { label: 'Volume (Qty)', value: formatVolume(predictionData.features.Volume), color: '#bc34fa' },
                ].map(({ label, value, color }, i) => (
                  <div key={i} className="bg-slate-950/60 rounded-xl p-3 font-mono" style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
                    <span className="text-[7px] text-slate-500 font-black uppercase tracking-widest block mb-1">{label}</span>
                    <span className="text-[11px] font-black block" style={{ color }}>{value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── AI News Sentiment & Headlines Section ── */}
          {(() => {
            const dominantSentiment = displaySentiment.positive > displaySentiment.negative + 10 ? 'Bullish'
              : displaySentiment.negative > displaySentiment.positive + 10 ? 'Bearish' : 'Neutral';
            const domColor = dominantSentiment === 'Bullish' ? '#00ff66' : dominantSentiment === 'Bearish' ? '#ff2d55' : '#f59e0b';
            
            const pieData = [
              { name: 'Positive', value: displaySentiment.positive, color: '#00ff66' },
              { name: 'Negative', value: displaySentiment.negative, color: '#ff2d55' },
              { name: 'Neutral', value: displaySentiment.neutral, color: '#bc34fa' }
            ];

            const drivers = [
              { label: displaySentiment.positive > 60 ? 'Strong earnings optimism detected' : 'Mixed earnings sentiment', positive: displaySentiment.positive > 60 },
              { label: displaySentiment.negative < 25 ? 'Low institutional selling pressure' : 'Elevated distribution activity', positive: displaySentiment.negative < 25 },
              { label: displaySentiment.neutral < 20 ? 'High market conviction signals' : 'Neutral macroeconomic backdrop', positive: displaySentiment.neutral < 20 },
            ];

            return (
              <motion.div
                key={symbol + '-news-sentiment'}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
                className="glass-card rounded-2xl overflow-hidden relative"
                style={{ border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-neon-cyan/40 to-transparent" />
                
                <div className="p-5">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-900/40 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl" style={{ background: domColor + '12', border: `1px solid ${domColor}25` }}>
                        <FiCompass className="w-3.5 h-3.5" style={{ color: domColor }} />
                      </div>
                      <div className="font-mono">
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">AI Market NLP</p>
                        <h3 className="text-[10px] font-black text-slate-100 uppercase tracking-wider mt-0.5">News Sentiment & Headlines</h3>
                      </div>
                    </div>
                    {/* Live update badge */}
                    <span className="inline-flex items-center gap-1.5 self-start sm:self-center text-[7px] font-black uppercase tracking-widest text-slate-450 font-mono border border-slate-800/60 px-2.5 py-1 rounded-full">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-emerald opacity-70" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-neon-emerald" />
                      </span>
                      Live AI Feed
                    </span>
                  </div>

                  {/* Main Grid: Left is summary, Right is scrollable news articles list */}
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    
                    {/* Left Column (2/5 size): Sentiment Donut & Meter Bars */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="px-3.5 py-3 rounded-xl font-mono text-[9px] text-slate-400 leading-relaxed"
                        style={{ background: domColor + '06', border: `1px solid ${domColor}15` }}>
                        {displaySentiment.explanation}
                      </div>

                      {/* Donut + Meters */}
                      <div className="flex flex-row items-center gap-4">
                        <div className="relative w-28 h-28 shrink-0">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={pieData} cx="50%" cy="50%" innerRadius={36} outerRadius={48}
                                paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}
                              >
                                {pieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0}
                                    style={{ filter: `drop-shadow(0 0 4px ${entry.color}60)` }}
                                  />
                                ))}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-center font-mono">
                            <span className="text-sm font-black leading-none" style={{ color: domColor }}>{displaySentiment.positive}%</span>
                            <span className="text-[6px] font-black text-slate-650 uppercase tracking-widest mt-0.5">Positive</span>
                          </div>
                        </div>

                        {/* Meter bars */}
                        <div className="flex-1 space-y-2">
                          {[
                            { label: 'Positive', value: displaySentiment.positive, color: '#00ff66' },
                            { label: 'Negative', value: displaySentiment.negative, color: '#ff2d55' },
                            { label: 'Neutral', value: displaySentiment.neutral, color: '#bc34fa' },
                          ].map(({ label, value, color }) => (
                            <div key={label}>
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest font-mono">{label}</span>
                                <span className="text-[8.5px] font-black font-mono" style={{ color }}>{value}%</span>
                              </div>
                              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                <motion.div
                                  className="h-full rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${value}%` }}
                                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                                  style={{ background: `linear-gradient(90deg, ${color}50, ${color})` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Drivers */}
                      <div className="pt-3.5 border-t border-slate-900/40">
                        <div className="flex items-center gap-1.5 mb-2.5">
                          <FiTrendingUp className="w-3 h-3 text-slate-550" />
                          <span className="text-[7.5px] font-black uppercase tracking-widest text-slate-550 font-mono">Sentiment Drivers</span>
                        </div>
                        <div className="space-y-1.5">
                          {drivers.map(({ label, positive: isPos }, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse" style={{ background: isPos ? '#00ff66' : '#f59e0b' }} />
                              <span className="text-[8px] text-slate-450 font-medium font-sans leading-none">{label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column (3/5 size): Headlines Grid list */}
                    <div className="lg:col-span-3 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-900/40 pt-4 lg:pt-0 lg:pl-6">
                      <span className="text-[7.5px] font-black text-slate-500 uppercase tracking-widest font-mono block mb-3">Bloomberg Wire Headlines</span>
                      
                      {newsLoading ? (
                        <div className="space-y-3 flex-1 min-h-[240px]">
                          {[1, 2, 3].map((n) => (
                            <div key={n} className="rounded-xl p-4 bg-slate-950/20 border border-slate-900/40 relative overflow-hidden h-[72px]">
                              <div className="absolute inset-0 shimmer opacity-25" />
                            </div>
                          ))}
                        </div>
                      ) : !news || news.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center min-h-[240px] rounded-xl border border-dashed border-slate-800/80 bg-slate-950/10 font-mono">
                          <span className="text-slate-650 text-[8px] font-black uppercase tracking-widest">No News Headlines for {symbol}</span>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1.5 scrollbar-none flex-1">
                          {news.map((item, i) => {
                            const sent = item.sentiment ? item.sentiment.toLowerCase() : 'neutral';
                            const badgeClass = sent === 'positive' ? 'glow-badge-buy' : sent === 'negative' ? 'glow-badge-sell' : 'glow-badge-hold';
                            return (
                              <motion.div
                                key={i}
                                whileHover={{ x: 2, backgroundColor: 'rgba(255,255,255,0.015)' }}
                                className="p-3.5 rounded-xl border border-slate-900/60 bg-slate-950/30 flex flex-col gap-2.5 transition-all duration-200"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="space-y-1 flex-1">
                                    <h4 className="text-[10px] font-black text-slate-200 tracking-wide leading-snug hover:text-neon-cyan transition-colors">
                                      {item.title}
                                    </h4>
                                    <div className="flex items-center gap-2 font-mono text-[7px] text-slate-500">
                                      <span className="font-bold text-slate-400">{item.source}</span>
                                      <span>•</span>
                                      <span>{item.date}</span>
                                    </div>
                                  </div>
                                  
                                  {/* Sentiment Badge */}
                                  <span className={`px-2 py-0.5 rounded text-[7px] font-black tracking-widest uppercase shrink-0 font-mono ${badgeClass}`}>
                                    {item.sentiment || 'NEUTRAL'}
                                  </span>
                                </div>
                                
                                {item.summary && item.summary !== item.title && (
                                  <p className="text-[8.5px] text-slate-500 leading-normal line-clamp-2 font-sans font-medium">
                                    {item.summary}
                                  </p>
                                )}
                                
                                {item.url && (
                                  <div className="flex justify-end">
                                    <a
                                      href={item.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-[7.5px] font-black uppercase tracking-widest text-neon-cyan hover:text-neon-cyan/70 font-mono"
                                    >
                                      Read More <FiArrowUpRight className="w-2.5 h-2.5" />
                                    </a>
                                  </div>
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    
                  </div>
                </div>
              </motion.div>
            );
          })()}

          {/* ── Premium AI Insights Assistant ── */}
          {(() => {
            if (!activePrediction || !predictionData) return null;
            const predDir = activePrediction.direction || 'neutral';
            const techStatus = predictionData.technicals?.rsi?.status || 'Neutral';
            const sentimentScore = predictionData.sentiment?.positive || 50;
            const insightText = predDir === 'bullish'
              ? `Strong bullish structure detected due to improving ${techStatus} technicals, positive momentum, and supportive market sentiment (${sentimentScore}% Positive).`
              : predDir === 'bearish'
                ? `Bearish pressure observed due to deteriorating ${techStatus} technicals, heavy distribution volume, and cautious market sentiment (${sentimentScore}% Positive).`
                : `Neutral consolidation range established with mixed ${techStatus} technical signals and balanced sentiment.`;

            const riskLevel = activePrediction.confidence > 75 ? 'Low Risk' : activePrediction.confidence > 55 ? 'Moderate Risk' : 'High Volatility';
            const riskColor = riskLevel === 'Low Risk' ? 'text-neon-emerald' : riskLevel === 'Moderate Risk' ? 'text-amber-400' : 'text-neon-rose';
            const riskBg = riskLevel === 'Low Risk' ? 'bg-neon-emerald/10 border-neon-emerald/20' : riskLevel === 'Moderate Risk' ? 'bg-amber-400/10 border-amber-400/20' : 'bg-neon-rose/10 border-neon-rose/20';

            return (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
                className="glass-card rounded-2xl p-5 relative overflow-hidden"
                style={{ border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 8px 32px -8px rgba(0,0,0,0.5)' }}
              >
                {/* Neural background glow */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-neon-cyan/5 rounded-full blur-[80px] pointer-events-none" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900/60 pb-4 mb-4 relative z-10">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-neon-cyan/10 border border-neon-cyan/25 relative overflow-hidden">
                      <div className="absolute inset-0 bg-neon-cyan/20 animate-pulse" />
                      <FiZap className="w-3.5 h-3.5 text-neon-cyan relative z-10" />
                    </div>
                    <div className="font-mono">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Neural Analysis</p>
                      <h3 className="text-[10px] font-black text-slate-100 uppercase tracking-wider mt-0.5">AI Insights Assistant</h3>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest font-mono border flex items-center gap-1.5 ${riskBg} ${riskColor}`}>
                    <FiShield className="w-2.5 h-2.5" />
                    {riskLevel}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
                  <div className="md:col-span-2">
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-500 font-mono mb-2">Dynamic Explanation</h4>
                    <p className="text-[11px] leading-relaxed text-slate-300 font-medium">
                      "{insightText}"
                    </p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[8px] font-mono text-slate-400 uppercase tracking-widest">
                        {predictionData.technicals?.macd?.status || 'MACD Active'}
                      </span>
                      <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[8px] font-mono text-slate-400 uppercase tracking-widest">
                        Sentiment: {activePrediction.direction}
                      </span>
                      <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[8px] font-mono text-slate-400 uppercase tracking-widest">
                        Trend Alignment
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-900/60 font-mono flex flex-col justify-center">
                    <h4 className="text-[8px] font-black uppercase tracking-widest text-slate-500 mb-3 text-center">AI Confidence Summary</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[9px]">
                        <span className="text-slate-400">Model Accuracy</span>
                        <span className="text-neon-cyan font-black">94.2%</span>
                      </div>
                      <div className="flex justify-between items-center text-[9px]">
                        <span className="text-slate-400">Live Confidence</span>
                        <span className="text-slate-100 font-black">{activePrediction.confidence}%</span>
                      </div>
                      <div className="flex justify-between items-center text-[9px]">
                        <span className="text-slate-400">Signal Quality</span>
                        <span className="text-neon-emerald font-black">Premium</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })()}

          {/* ── Premium Prediction History Table ── */}
          {(() => {
            const winCount = paginatedLogs.filter(l => l.outcome === 'WIN').length;
            const winRate = paginatedLogs.length ? Math.round((winCount / paginatedLogs.length) * 100) : 0;
            const avgConf = paginatedLogs.length ? Math.round(paginatedLogs.reduce((acc, l) => acc + parseInt(l.confidence), 0) / paginatedLogs.length) : 0;

            return (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                className="glass-card rounded-2xl p-5 relative overflow-hidden"
                style={{ border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 8px 32px -8px rgba(0,0,0,0.5)' }}
              >
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-slate-500/30 to-transparent" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-slate-900/60 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                      <FiBookmark className="w-3.5 h-3.5 text-slate-300" />
                    </div>
                    <div className="font-mono">
                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">System Logs</p>
                      <h3 className="text-[10px] font-black text-slate-100 uppercase tracking-wider mt-0.5">Prediction History</h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Search Box */}
                    <div className="relative font-mono text-[9px] w-full sm:w-48">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-3 h-3" />
                      <input
                        type="text"
                        value={historySearchQuery}
                        onChange={(e) => {
                          setHistorySearchQuery(e.target.value);
                          setHistoryPage(1);
                        }}
                        placeholder="Search Tickers..."
                        className="pl-8 pr-3 py-1.5 w-full bg-slate-950/60 border border-slate-800 rounded-lg text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-neon-cyan/40 transition-colors"
                      />
                    </div>
                    {/* Export Button */}
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-600 text-slate-300 font-mono text-[9px] font-black uppercase tracking-widest transition-colors"
                      onClick={() => {
                        const btn = document.getElementById('export-btn');
                        if (btn) {
                          btn.innerHTML = '<span class="animate-pulse">Exporting...</span>';
                          setTimeout(() => { btn.innerHTML = 'Export CSV'; }, 1500);
                        }
                      }}
                      id="export-btn"
                    >
                      <FiDownload className="w-3 h-3" />
                      Export CSV
                    </button>
                  </div>
                </div>

                {/* Analytics Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-900/40 font-mono">
                    <span className="text-[7px] text-slate-500 font-black uppercase tracking-widest block mb-1">Total Signals</span>
                    <span className="text-[11px] text-slate-100 font-black">{paginatedLogs.length}</span>
                  </div>
                  <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-900/40 font-mono">
                    <span className="text-[7px] text-slate-500 font-black uppercase tracking-widest block mb-1">Avg Win Rate</span>
                    <span className="text-[11px] text-neon-emerald font-black">{winRate}%</span>
                  </div>
                  <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-900/40 font-mono">
                    <span className="text-[7px] text-slate-500 font-black uppercase tracking-widest block mb-1">Avg Confidence</span>
                    <span className="text-[11px] text-neon-cyan font-black">{avgConf}%</span>
                  </div>
                  <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-900/40 font-mono">
                    <span className="text-[7px] text-slate-500 font-black uppercase tracking-widest block mb-1">Best Asset</span>
                    <span className="text-[11px] text-amber-400 font-black">AAPL</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-[9px] border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-slate-900/60 text-slate-500 font-black uppercase tracking-widest">
                        <th className="py-3 px-4 cursor-pointer hover:text-slate-300 transition-colors group" onClick={() => handleSort('stock')}>
                          Asset <span className="text-[7px] text-slate-700 group-hover:text-slate-500 ml-1">↕</span>
                        </th>
                        <th className="py-3 px-4 cursor-pointer hover:text-slate-300 transition-colors group" onClick={() => handleSort('prediction')}>
                          Signal <span className="text-[7px] text-slate-700 group-hover:text-slate-500 ml-1">↕</span>
                        </th>
                        <th className="py-3 px-4 cursor-pointer hover:text-slate-300 transition-colors group" onClick={() => handleSort('confidence')}>
                          Prob <span className="text-[7px] text-slate-700 group-hover:text-slate-500 ml-1">↕</span>
                        </th>
                        <th className="py-3 px-4 cursor-pointer hover:text-slate-300 transition-colors group">
                          Tech & Sentiment
                        </th>
                        <th className="py-3 px-4 cursor-pointer hover:text-slate-300 transition-colors group" onClick={() => handleSort('outcome')}>
                          Result <span className="text-[7px] text-slate-700 group-hover:text-slate-500 ml-1">↕</span>
                        </th>
                        <th className="py-3 px-4 cursor-pointer hover:text-slate-300 transition-colors group" onClick={() => handleSort('date')}>
                          Timestamp <span className="text-[7px] text-slate-700 group-hover:text-slate-500 ml-1">↕</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/40">
                      {paginatedLogs.map((log, index) => {
                        const isBuy = log.prediction.includes('BUY');
                        const isSell = log.prediction.includes('SELL');
                        const isWin = log.outcome === 'WIN';
                        const confVal = parseInt(log.confidence);

                        return (
                          <tr key={index} className="hover:bg-slate-900/20 transition-colors group">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded bg-slate-900 flex items-center justify-center border border-slate-800 shadow-inner">
                                  <span className="text-[8px] font-black text-slate-300">{log.stock.charAt(0)}</span>
                                </div>
                                <span className="font-black text-slate-200 tracking-wider text-[10px]">{log.stock}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-1 rounded-md text-[7px] font-black uppercase tracking-widest border"
                                style={{
                                  color: isBuy ? '#00ff66' : isSell ? '#ff2d55' : '#f59e0b',
                                  background: isBuy ? 'rgba(0,255,102,0.08)' : isSell ? 'rgba(255,45,85,0.08)' : 'rgba(245,158,11,0.08)',
                                  borderColor: isBuy ? 'rgba(0,255,102,0.2)' : isSell ? 'rgba(255,45,85,0.2)' : 'rgba(245,158,11,0.2)'
                                }}>
                                {log.prediction}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-col gap-1 w-16">
                                <span className="font-bold text-slate-300 text-[8px]">{log.confidence}</span>
                                <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                                  <div className="h-full rounded-full" style={{ width: log.confidence, background: isBuy ? '#00ff66' : isSell ? '#ff2d55' : '#f59e0b' }} />
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <span className={`px-1.5 py-0.5 rounded text-[6px] font-black uppercase ${isBuy ? 'bg-neon-emerald/10 text-neon-emerald' : 'bg-neon-rose/10 text-neon-rose'}`}>MACD</span>
                                <span className={`px-1.5 py-0.5 rounded text-[6px] font-black uppercase ${isBuy ? 'bg-neon-cyan/10 text-neon-cyan' : 'bg-amber-400/10 text-amber-400'}`}>RSI</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-black" style={{ color: isWin ? '#00ff66' : '#ff2d55', textShadow: isWin ? '0 0 10px rgba(0,255,102,0.3)' : '0 0 10px rgba(255,45,85,0.3)' }}>
                                {isWin ? '✓ ' : '✕ '} {log.outcome}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-500 font-semibold">{log.date}</td>
                          </tr>
                        );
                      })}
                      {paginatedLogs.length === 0 && (
                        <tr>
                          <td colSpan="6" className="py-8 text-center text-[9px] text-slate-600 uppercase font-black tracking-widest">
                            No telemetry logs matched filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-slate-900/60 pt-4 mt-2 font-mono text-[8px] uppercase tracking-widest font-black text-slate-500">
                    <span>Page {historyPage} of {totalPages}</span>
                    <div className="flex gap-2">
                      <button
                        disabled={historyPage === 1}
                        onClick={() => setHistoryPage(historyPage - 1)}
                        className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-900 hover:text-slate-300 transition-colors"
                      >
                        <FiChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        disabled={historyPage === totalPages}
                        onClick={() => setHistoryPage(historyPage + 1)}
                        className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-900 hover:text-slate-300 transition-colors"
                      >
                        <FiChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })()}
        </div>

        {/* Right Columns (AI Predictor, Watchlists, Insights) */}
        <div className="space-y-6">

          {/* ── AI Trading Intelligence Hero Card ── */}
          {(() => {
            const isBull = activePrediction.prediction === 'BUY';
            const isBear = activePrediction.prediction === 'SELL';
            const predColor = isBull ? '#00ff66' : isBear ? '#ff2d55' : '#f59e0b';
            const dominantSentiment = activeSentiment.positive > activeSentiment.negative + 10 ? 'Bullish'
              : activeSentiment.negative > activeSentiment.positive + 10 ? 'Bearish' : 'Neutral';

            return (
              <motion.div
                id="predictions"
                key={symbol}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="premium-gradient-border overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.7)]"
              >
                {/* Glass body */}
                <div className="relative p-5 backdrop-blur-2xl bg-[#090d16]/70 z-10">

                  {/* Ambient glow blobs */}
                  <div className="absolute top-0 right-0 w-48 h-36 rounded-full blur-3xl pointer-events-none opacity-30"
                    style={{ background: predColor + '15' }} />
                  <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-3xl pointer-events-none opacity-15"
                    style={{ background: predColor + '08' }} />
                  {/* Grid mesh */}
                  <div className="absolute inset-0 grid-mesh-subtle opacity-10 pointer-events-none" />

                  <div className="relative">

                    {/* ── Company identity header ── */}
                    <div className="flex items-center justify-between border-b border-slate-900/60 pb-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[11px] bg-gradient-to-br ${getLogoClass(symbol)} shadow-md border border-slate-700/20 shrink-0 font-mono tracking-wide`}>
                          {symbol ? symbol.replace('.NS', '').replace('.BO', '').slice(0, 2).toUpperCase() : 'ST'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-slate-100 font-mono tracking-widest">{symbol}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                              • {currentStock.exchange || 'NASDAQ'} {currentStock.countryFlag || '🇺🇸'}
                            </span>
                          </div>
                          <span className="text-[9px] text-slate-500 font-semibold font-sans mt-0.5 block truncate max-w-[150px] sm:max-w-none">{name}</span>
                        </div>
                      </div>

                      {/* Flag and Market label */}
                      <div className="text-right shrink-0">
                        <span className="text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded bg-slate-900/80 border border-slate-800/85 text-slate-400 font-mono">
                          {currentStock.country || 'USA'} {currentStock.countryFlag || '🇺🇸'}
                        </span>
                      </div>
                    </div>

                    {/* ── Price and prediction section ── */}
                    <div className="flex flex-col gap-4 mb-5">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest font-mono block mb-1">Current Stock Price</span>
                          <span className="text-2xl font-black font-mono tracking-tight text-slate-100 leading-none">
                            {formatCurrency(price, currentStock.currency)}
                          </span>
                        </div>
                        
                        {/* Prediction signal badge */}
                        <div className="text-right">
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest font-mono block mb-1">AI Verdict</span>
                          <span className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest font-mono inline-block ${
                            activePrediction.prediction === 'BUY' ? 'glow-badge-buy' : 
                            activePrediction.prediction === 'SELL' ? 'glow-badge-sell' : 'glow-badge-hold'
                          }`}>
                            {activePrediction.prediction === 'BUY' ? '▲ BUY' : activePrediction.prediction === 'SELL' ? '▼ SELL' : '⏸ HOLD'}
                          </span>
                        </div>
                      </div>

                      {/* Confidence slider */}
                      <div className="bg-slate-950/40 border border-slate-900/60 rounded-xl p-3.5">
                        <div className="flex items-center justify-between text-[9px] font-black font-mono mb-2">
                          <span className="text-slate-500 uppercase tracking-widest">Confidence Index</span>
                          <span style={{ color: predColor }}>{activePrediction.confidence}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden relative border border-slate-900/50">
                          <motion.div
                            className="h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${activePrediction.confidence}%` }}
                            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                            style={{ 
                              background: `linear-gradient(90deg, ${predColor}60, ${predColor})`,
                              boxShadow: `0 0 8px ${predColor}`
                            }}
                          />
                        </div>
                        <div className="flex justify-between items-center mt-2 text-[8px] font-mono text-slate-550">
                          <span>Risk: {activePrediction.confidence > 75 ? 'Low' : 'Moderate'}</span>
                          <span>Signal Strength: {activePrediction.strength}</span>
                        </div>
                      </div>
                    </div>

                    {/* ── Technical oscillators grid ── */}
                    <div className="bg-slate-950/30 border border-slate-900/40 rounded-xl p-3.5 mb-4">
                      <span className="text-[8px] font-black text-slate-550 uppercase tracking-widest font-mono block mb-3">Bloomberg Telemetry</span>
                      <div className="grid grid-cols-2 gap-3.5 font-mono text-[9px]">
                        <div>
                          <span className="text-slate-600 block uppercase tracking-wider text-[8px]">Relative Strength (RSI)</span>
                          <span className="font-extrabold text-slate-300 block mt-1">
                            {activeTechnicals.rsi?.value ?? '—'} <span className="text-slate-500 text-[8px]">({activeTechnicals.rsi?.status || 'Neutral'})</span>
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600 block uppercase tracking-wider text-[8px]">MACD Convergence</span>
                          <span className="font-extrabold text-slate-300 block mt-1">
                            {activeTechnicals.macd?.value ?? '—'} <span className="text-slate-500 text-[8px]">({activeTechnicals.macd?.status || 'Neutral'})</span>
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600 block uppercase tracking-wider text-[8px]">Technical Signal</span>
                          <span className={`font-black block mt-1 uppercase`} style={{ color: predColor }}>
                            {activePrediction.strength} {activePrediction.direction === 'bullish' ? 'Bullish' : activePrediction.direction === 'bearish' ? 'Bearish' : 'Neutral'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600 block uppercase tracking-wider text-[8px]">Market Sentiment</span>
                          <span className="font-extrabold text-slate-300 block mt-1">
                            {dominantSentiment} <span className="text-slate-500 text-[8px]">({activeSentiment.positive}% Pos)</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ── AI Reasoning ── */}
                    <div className="mb-5 px-3.5 py-3 rounded-xl font-mono text-[10px]"
                      style={{ background: predColor + '06', border: `1px solid ${predColor}15` }}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <FiCpu className="w-3 h-3" style={{ color: predColor }} />
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 font-mono">Neural Model Rationale</span>
                      </div>
                      <p className="text-slate-400 leading-relaxed font-sans">{activePrediction.reasoning}</p>
                    </div>

                    {/* ── Action buttons ── */}
                    <div className="grid grid-cols-2 gap-2.5 font-mono text-[9px] font-black uppercase tracking-widest">
                      <motion.button
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center justify-center gap-1.5 py-3 rounded-xl cursor-pointer transition-all duration-200"
                        style={{
                          background: 'linear-gradient(135deg, #00ff66 0%, #00cc55 100%)', color: '#030d04',
                          boxShadow: '0 4px 16px rgba(0,255,102,0.30)'
                        }}
                      >
                        <FiBuy className="w-3.5 h-3.5" />
                        Buy Long
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center justify-center gap-1.5 py-3 rounded-xl cursor-pointer transition-all duration-200"
                        style={{
                          background: 'linear-gradient(135deg, #ff2d55 0%, #cc1133 100%)', color: '#fff',
                          boxShadow: '0 4px 16px rgba(255,45,85,0.30)'
                        }}
                      >
                        <FiSell className="w-3.5 h-3.5" />
                        Sell Short
                      </motion.button>
                    </div>

                  </div>
                </div>
              </motion.div>
            );
          })()}

          {/* ── AI Insights Synthesis removed → merged into prediction card above ── */}

          {/* 9. Watchlist Section */}
          <div id="watchlist">
            <Watchlist />
          </div>
        </div>
      </div>
      </div>
      )}

      {/* Floating toast notifications */}
      <div className="fixed bottom-6 left-6 z-[9999] flex flex-col gap-3 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: -50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.9 }}
              className={`pointer-events-auto p-4 rounded-xl border flex flex-col shadow-2xl relative overflow-hidden backdrop-blur-xl ${
                toast.type === 'success' ? 'bg-[#00ff66]/10 border-[#00ff66]/40 text-slate-100 shadow-[0_0_20px_rgba(0,255,102,0.15)]' :
                toast.type === 'error' ? 'bg-[#ff2d55]/10 border-[#ff2d55]/40 text-slate-100 shadow-[0_0_20px_rgba(255,45,85,0.15)]' :
                toast.type === 'warning' ? 'bg-amber-500/10 border-amber-500/40 text-slate-150 shadow-[0_0_20px_rgba(245,158,11,0.15)]' :
                'bg-slate-900/90 border-slate-800 text-slate-100'
              }`}
            >
              <div className="flex items-center justify-between font-mono mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest">{toast.title}</span>
                <button 
                  onClick={() => removeToast(toast.id)}
                  className="text-slate-500 hover:text-slate-205 transition-colors ml-4 cursor-pointer font-bold text-[10px]"
                >
                  ✕
                </button>
              </div>
              <p className="text-[11px] font-medium leading-relaxed font-sans">{toast.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}

// Premium floating OHLC tooltip
const PremiumTooltip = ({ active, payload, isUp, currency = 'USD' }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    const dailyChange = d.close && d.open ? (((d.close - d.open) / d.open) * 100).toFixed(2) : null;
    const bullish = d.close >= d.open;
    return (
      <div
        className="font-mono rounded-xl overflow-hidden shadow-2xl"
        style={{
          background: 'rgba(5,10,20,0.92)',
          border: `1px solid ${bullish ? 'rgba(0,255,102,0.2)' : 'rgba(255,45,85,0.2)'}`,
          backdropFilter: 'blur(16px)',
          boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px ${bullish ? 'rgba(0,255,102,0.08)' : 'rgba(255,45,85,0.08)'}`,
          minWidth: '168px',
        }}
      >
        {/* Top accent */}
        <div className={`h-[1.5px] bg-gradient-to-r ${bullish ? 'from-transparent via-neon-emerald/60' : 'from-transparent via-neon-rose/60'} to-transparent`} />

        {/* Date row */}
        <div className="px-3.5 pt-3 pb-1.5 border-b border-slate-900/60">
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{d.date}</span>
          {dailyChange !== null && (
            <span className={`ml-2 text-[8px] font-black ${bullish ? 'text-neon-emerald' : 'text-neon-rose'}`}>
              {bullish ? '▲' : '▼'} {Math.abs(dailyChange)}%
            </span>
          )}
        </div>

        {/* OHLC rows */}
        <div className="px-3.5 py-2.5 space-y-1.5">
          {[
            { label: 'Open', value: d.open, color: 'text-slate-300' },
            { label: 'High', value: d.high, color: 'text-neon-emerald' },
            { label: 'Low', value: d.low, color: 'text-neon-rose' },
            { label: 'Close', value: d.close, color: bullish ? 'text-neon-emerald' : 'text-neon-rose' },
            { label: 'Volume', value: d.volume, color: 'text-neon-cyan', isVolume: true },
          ].map(({ label, value, color, isVolume }) => (
            <div key={label} className="flex items-center justify-between gap-5">
              <span className="text-[8px] text-slate-600 uppercase tracking-widest">{label}</span>
              <span className={`text-[9px] font-black ${color}`}>
                {value != null ? (isVolume ? formatVolume(value) : formatCurrency(value, currency)) : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

