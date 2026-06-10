import React, { useState, useEffect, useMemo } from 'react';
import { useStock } from '../context/StockContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBriefcase,
  FiTrendingUp,
  FiTrendingDown,
  FiPlus,
  FiMinus,
  FiDollarSign,
  FiCompass,
  FiCpu,
  FiShield,
  FiArrowUpRight,
  FiActivity,
  FiRefreshCw
} from 'react-icons/fi';

export default function Portfolio() {
  const {
    portfolio,
    fetchPortfolio,
    buyStock,
    sellStock,
    allStocks,
    currentStock,
    setSelectedStockSymbol
  } = useStock();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('portfolio'); // portfolio, trade, simulator
  const [selectedStockId, setSelectedStockId] = useState('AAPL');
  
  // Trade state
  const [tradeType, setTradeType] = useState('buy');
  const [sharesInput, setSharesInput] = useState('10');
  const [priceInput, setPriceInput] = useState('180');
  const [tradeMessage, setTradeMessage] = useState(null);
  const [tradeError, setTradeError] = useState(null);
  const [isTrading, setIsTrading] = useState(false);

  // Profit Simulator state
  const [simAmount, setSimAmount] = useState('10000');
  const [simTimeframe, setSimTimeframe] = useState('12'); // 1, 3, 6, 12 months

  useEffect(() => {
    fetchPortfolio();
  }, []);

  // Sync price input when selected stock details update
  const targetStockDetails = useMemo(() => {
    return allStocks.find(s => s.symbol === selectedStockId) || allStocks[0];
  }, [selectedStockId, allStocks]);

  useEffect(() => {
    if (targetStockDetails) {
      setPriceInput(targetStockDetails.price.toString());
    }
  }, [selectedStockId, targetStockDetails]);

  const handleTradeSubmit = async (e) => {
    e.preventDefault();
    setTradeMessage(null);
    setTradeError(null);
    setIsTrading(true);

    try {
      const qty = Number(sharesInput);
      const px = Number(priceInput);
      if (isNaN(qty) || qty <= 0 || isNaN(px) || px <= 0) {
        throw new Error('Please enter a valid amount of shares and purchase price.');
      }

      if (tradeType === 'buy') {
        await buyStock(selectedStockId, qty, px);
        setTradeMessage(`Successfully bought ${qty} shares of ${selectedStockId} at ${formatCurrency(px, targetStockDetails?.currency)}!`);
      } else {
        await sellStock(selectedStockId, qty);
        setTradeMessage(`Successfully liquidated ${qty} shares of ${selectedStockId}!`);
      }
      
      setSharesInput('10');
    } catch (err) {
      setTradeError(err.message || 'Trade execution failed.');
    } finally {
      setIsTrading(false);
    }
  };

  // ── AI PORTFOLIO RECOMMENDATION SYNTHESIS ──
  const activeStockInfo = useMemo(() => {
    return targetStockDetails;
  }, [targetStockDetails]);

  const recommendationMetrics = useMemo(() => {
    if (!activeStockInfo) return null;
    
    // Check if the backend already enriched it, otherwise run client-side synthesis
    if (activeStockInfo.aiRecommendationEngine) {
      return {
        rec: activeStockInfo.aiRecommendationEngine,
        risk: activeStockInfo.riskAnalysis
      };
    }

    // Client-side synthesis fallback
    const symbol = activeStockInfo.symbol;
    const isBull = activeStockInfo.aiPrediction?.direction === 'bullish';
    const isBear = activeStockInfo.aiPrediction?.direction === 'bearish';
    const rsiVal = activeStockInfo.technicals?.rsi?.value || 50;
    const positiveSent = activeStockInfo.sentiment?.positive || 50;
    const negativeSent = activeStockInfo.sentiment?.negative || 20;

    let score = 0;
    if (isBull) score += 4;
    else if (isBear) score -= 4;

    if (rsiVal > 70) score -= 2.5;
    else if (rsiVal < 30) score += 2.5;
    else if (rsiVal > 55) score += 1.0;
    else if (rsiVal < 45) score -= 1.0;

    if (positiveSent > negativeSent + 15) score += 2.0;
    else if (negativeSent > positiveSent + 15) score -= 2.0;

    let recommendation = 'HOLD';
    let badgeColor = 'text-amber-400 border-amber-500/20 bg-amber-500/10 shadow-[0_0_12px_rgba(245,158,11,0.05)]';
    let glowClass = 'glow-badge-hold';
    
    if (score >= 2.5) {
      recommendation = 'STRONG BUY';
      badgeColor = 'text-neon-emerald border-neon-emerald/20 bg-neon-emerald/10 shadow-[0_0_12px_rgba(0,255,102,0.1)]';
      glowClass = 'glow-badge-buy';
    } else if (score >= 0.5) {
      recommendation = 'BUY';
      badgeColor = 'text-neon-emerald border-neon-emerald/20 bg-neon-emerald/10 shadow-[0_0_12px_rgba(0,255,102,0.05)]';
      glowClass = 'glow-badge-buy';
    } else if (score <= -2.5) {
      recommendation = 'STRONG SELL';
      badgeColor = 'text-neon-rose border-neon-rose/20 bg-neon-rose/10 shadow-[0_0_12px_rgba(255,45,85,0.1)]';
      glowClass = 'glow-badge-sell';
    } else if (score <= -0.5) {
      recommendation = 'SELL';
      badgeColor = 'text-neon-rose border-neon-rose/20 bg-neon-rose/10 shadow-[0_0_12px_rgba(255,45,85,0.05)]';
      glowClass = 'glow-badge-sell';
    }

    const volatility = activeStockInfo.technicals?.volatility?.value || (symbol.includes('TSLA') ? 38 : symbol.includes('AAPL') ? 18 : 22);
    const atrPercent = symbol.includes('TSLA') ? 4.8 : symbol.includes('AAPL') ? 1.7 : 2.1;
    
    let riskPoints = 0;
    if (volatility > 30) riskPoints += 2;
    else if (volatility > 18) riskPoints += 1;
    if (atrPercent > 2.5) riskPoints += 2;
    if (negativeSent > 45) riskPoints += 1;

    let riskLevel = 'Medium Risk';
    let riskColor = 'text-amber-450 border-amber-450/20 bg-amber-450/10';
    let riskBadge = '🟡 Medium';
    if (riskPoints <= 1) {
      riskLevel = 'Low Risk';
      riskColor = 'text-neon-emerald border-neon-emerald/20 bg-neon-emerald/10';
      riskBadge = '🟢 Low';
    } else if (riskPoints >= 4) {
      riskLevel = 'High Risk';
      riskColor = 'text-neon-rose border-neon-rose/20 bg-neon-rose/10';
      riskBadge = '🔴 High';
    }

    return {
      rec: {
        recommendation,
        rationale: `AI recommendation models have compiled a ${recommendation} verdict for ${symbol} based on a score of ${score.toFixed(1)}. Sentiment bias is ${positiveSent > negativeSent ? 'bullish' : 'bearish'}.`,
        factors: [
          { name: 'Model Signal', signal: isBull ? 'Bullish' : isBear ? 'Bearish' : 'Neutral' },
          { name: 'RSI Momentum', signal: `${rsiVal} Value` },
          { name: 'News NLP Sentiment', signal: `${positiveSent}% Pos` }
        ],
        badgeColor,
        glowClass
      },
      risk: {
        riskLevel,
        riskColor,
        riskBadge,
        volatility,
        atrPercent,
        factors: [
          { name: 'Volatility index', value: `${volatility}%` },
          { name: 'ATR/Price Swing', value: `${atrPercent}%` }
        ]
      }
    };
  }, [activeStockInfo]);

  // ── FEATURE 4: PROFIT CALCULATOR MULTI-SCENARIO MODELING ──
  const simulatedResults = useMemo(() => {
    if (!activeStockInfo || !recommendationMetrics) return null;
    const amount = Number(simAmount) || 10000;
    const months = Number(simTimeframe) || 12;
    const t = months / 12;

    const riskMeta = recommendationMetrics.risk;
    const recMeta = recommendationMetrics.rec;

    // Expected yield model
    let baseAnnualYield = 0.12; // 12% standard index growth
    if (recMeta.recommendation === 'STRONG BUY') baseAnnualYield += 0.15;
    else if (recMeta.recommendation === 'BUY') baseAnnualYield += 0.08;
    else if (recMeta.recommendation === 'SELL') baseAnnualYield -= 0.08;
    else if (recMeta.recommendation === 'STRONG SELL') baseAnnualYield -= 0.15;

    // Add small positive drift for Indian markets
    if (activeStockInfo.symbol.endsWith('.NS')) {
      baseAnnualYield += 0.03;
    }

    // Volatility bounds
    const vol = (riskMeta.volatility || 22) / 100;

    const expectedRate = baseAnnualYield * t;
    const expectedValue = amount * (1 + expectedRate);
    const expectedProfit = expectedValue - amount;

    // Upside scenario (1.5 Volatility SD)
    const bestRate = expectedRate + (vol * 1.5 * Math.sqrt(t));
    const bestValue = amount * (1 + bestRate);
    const bestProfit = bestValue - amount;

    // Downside scenario (-1.5 Volatility SD)
    const worstRate = expectedRate - (vol * 1.5 * Math.sqrt(t));
    const worstValue = amount * (1 + worstRate);
    const worstProfit = worstValue - amount;

    return {
      expected: { value: expectedValue, profit: expectedProfit, percent: expectedRate * 100 },
      best: { value: bestValue, profit: bestProfit, percent: bestRate * 100 },
      worst: { value: worstValue, profit: worstProfit, percent: worstRate * 100 }
    };
  }, [activeStockInfo, recommendationMetrics, simAmount, simTimeframe]);

  const currencySymbol = targetStockDetails?.symbol || '$';

  return (
    <div className="space-y-6 text-slate-100 font-sans z-10 relative">
      
      {/* ── Subtitle Title Hero Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-6 relative border border-slate-800/60 overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-neon-cyan/50 to-transparent" />
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-neon-cyan/3 rounded-full blur-[80px] pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-100 leading-none font-mono">
              PORTFOLIO{' '}
              <span className="bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
                SIMULATOR
              </span>
            </h1>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] font-mono mt-2">
              Virtual Investment Office <span className="text-slate-700">//</span> Smart recommending engine
            </p>
          </div>

          {/* Navigation Pills */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-900/60 font-mono text-[9px] font-black uppercase tracking-wider">
            {[
              { id: 'portfolio', label: 'My Holdings', icon: FiBriefcase },
              { id: 'trade', label: 'Virtual Trade', icon: FiArrowUpRight },
              { id: 'simulator', label: 'Profit Projection', icon: FiActivity }
            ].map(tab => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setTradeMessage(null);
                    setTradeError(null);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg cursor-pointer transition-colors duration-250 ${
                    activeTab === tab.id ? 'bg-gradient-to-r from-neon-cyan to-neon-purple text-slate-950 font-black shadow-md' : 'text-slate-500 hover:text-slate-200'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* ── Tab Switcher Panels ── */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: PORTFOLIO HOLDINGS & METRICS SUMMARY */}
        {activeTab === 'portfolio' && (
          <motion.div
            key="portfolio-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            {/* Portfolio Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
              {[
                {
                  label: 'Simulated Asset Value',
                  value: formatCurrency(portfolio.summary.totalCurrent, 'INR'),
                  color: 'text-slate-100',
                  glow: 'rgba(255,255,255,0.03)',
                  bar: 'from-slate-600 to-slate-800'
                },
                {
                  label: 'Total Capital Invested',
                  value: formatCurrency(portfolio.summary.totalInvested, 'INR'),
                  color: 'text-neon-cyan',
                  glow: 'rgba(0,240,255,0.05)',
                  bar: 'from-neon-cyan/50 to-neon-cyan'
                },
                {
                  label: 'Net Profits & Losses',
                  value: `${portfolio.summary.totalProfitLoss >= 0 ? '+' : ''}${formatCurrency(portfolio.summary.totalProfitLoss, 'INR')}`,
                  color: portfolio.summary.totalProfitLoss >= 0 ? 'text-neon-emerald' : 'text-neon-rose',
                  glow: portfolio.summary.totalProfitLoss >= 0 ? 'rgba(0,255,102,0.06)' : 'rgba(255,45,85,0.06)',
                  bar: portfolio.summary.totalProfitLoss >= 0 ? 'from-neon-emerald/50 to-neon-emerald' : 'from-neon-rose/50 to-neon-rose'
                },
                {
                  label: 'Total Percentage Returns',
                  value: `${portfolio.summary.totalProfitLoss >= 0 ? '+' : ''}${portfolio.summary.totalPercentageReturn.toFixed(2)}%`,
                  color: portfolio.summary.totalProfitLoss >= 0 ? 'text-neon-emerald' : 'text-neon-rose',
                  glow: portfolio.summary.totalProfitLoss >= 0 ? 'rgba(0,255,102,0.06)' : 'rgba(255,45,85,0.06)',
                  bar: portfolio.summary.totalProfitLoss >= 0 ? 'from-neon-emerald/50 to-neon-emerald' : 'from-neon-rose/50 to-neon-rose'
                }
              ].map((stat, i) => (
                <div
                  key={i}
                  className="glass-card rounded-2xl p-4 sm:p-5 relative border border-slate-900/60 overflow-hidden"
                  style={{ boxShadow: `0 4px 20px -2px ${stat.glow}` }}
                >
                  <div className={`absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r ${stat.bar} to-transparent`} />
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">{stat.label}</span>
                  <span className={`text-base sm:text-lg lg:text-xl font-black tracking-tight leading-none block ${stat.color}`}>
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Holdings Table */}
            <div className="glass-card rounded-2xl p-5 border border-slate-800/60">
              <div className="flex items-center gap-2 mb-5 border-b border-slate-900/60 pb-4">
                <div className="p-2 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20">
                  <FiBriefcase className="w-3.5 h-3.5 text-neon-cyan" />
                </div>
                <div className="font-mono">
                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Active Holdings</p>
                  <h3 className="text-[10px] font-black text-slate-100 uppercase tracking-wider mt-0.5">Mock Holdings Ledger</h3>
                </div>
              </div>

              {portfolio.holdings.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 rounded-xl border border-dashed border-slate-800 bg-slate-950/20 font-mono text-center">
                  <FiBriefcase className="w-8 h-8 text-slate-650 mb-3 animate-pulse" />
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Simulated portfolio is empty</p>
                  <button
                    onClick={() => setActiveTab('trade')}
                    className="mt-4 px-4 py-2 bg-gradient-to-r from-neon-cyan to-neon-purple text-slate-950 font-black rounded-lg text-[9px] uppercase tracking-widest hover:shadow-lg hover:shadow-neon-cyan/20 cursor-pointer transition-shadow"
                  >
                    Invest Capital
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto scrollbar-none">
                  <table className="w-full text-left font-mono text-[9px] border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-slate-900/80 text-slate-500 font-black uppercase tracking-widest">
                        <th className="py-3 px-4">Asset</th>
                        <th className="py-3 px-4 text-right">Holdings Size</th>
                        <th className="py-3 px-4 text-right">Avg Purchase Price</th>
                        <th className="py-3 px-4 text-right">Live Stock Price</th>
                        <th className="py-3 px-4 text-right">Invested Capital</th>
                        <th className="py-3 px-4 text-right">Market Valuation</th>
                        <th className="py-3 px-4 text-right">P&L Profit</th>
                        <th className="py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/40 text-slate-200">
                      {portfolio.holdings.map((h, i) => {
                        const isProfit = h.profitLoss >= 0;
                        const symbolClean = h.symbol.replace('.NS', '').replace('.BO', '');
                        return (
                          <tr key={i} className="hover:bg-slate-900/20 transition-colors group">
                            {/* Asset */}
                            <td className="py-3 px-4 font-black">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-900 text-[8px] text-slate-100">
                                  {h.symbol}
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">
                                  {h.countryFlag} {h.exchange}
                                </span>
                              </div>
                            </td>
                            {/* Size */}
                            <td className="py-3 px-4 text-right font-bold text-slate-350">{h.shares}</td>
                            {/* Avg Price */}
                            <td className="py-3 px-4 text-right">{formatCurrency(h.buyPrice, h.currency)}</td>
                            {/* Live Price */}
                            <td className="py-3 px-4 text-right text-neon-cyan font-bold">{formatCurrency(h.currentPrice, h.currency)}</td>
                            {/* Invested */}
                            <td className="py-3 px-4 text-right text-slate-450">{formatCurrency(h.investedValue, h.currency)}</td>
                            {/* Valuation */}
                            <td className="py-3 px-4 text-right font-black text-slate-100">{formatCurrency(h.currentValue, h.currency)}</td>
                            {/* Profit */}
                            <td className={`py-3 px-4 text-right font-black ${isProfit ? 'text-neon-emerald' : 'text-neon-rose'}`}>
                              {isProfit ? '+' : ''}{formatCurrency(h.profitLoss, h.currency)}
                              <span className="text-[7.5px] ml-1 opacity-70">({isProfit ? '+' : ''}{h.percentageReturn.toFixed(2)}%)</span>
                            </td>
                            {/* Trade action */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => {
                                    setSelectedStockId(h.symbol);
                                    setTradeType('buy');
                                    setActiveTab('trade');
                                  }}
                                  className="p-1 rounded bg-slate-950 border border-slate-900 hover:border-neon-emerald/40 hover:text-neon-emerald transition-colors text-slate-500 cursor-pointer"
                                  title="Add Shares"
                                >
                                  <FiPlus className="w-2.5 h-2.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedStockId(h.symbol);
                                    setTradeType('sell');
                                    setActiveTab('trade');
                                  }}
                                  className="p-1 rounded bg-slate-950 border border-slate-900 hover:border-neon-rose/40 hover:text-neon-rose transition-colors text-slate-500 cursor-pointer"
                                  title="Liquidate Shares"
                                >
                                  <FiMinus className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 2: VIRTUAL TRADING CONSOLE & AI ENGINE PANELS */}
        {activeTab === 'trade' && (
          <motion.div
            key="trade-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left: Interactive Buy/Sell Form */}
            <div className="glass-card rounded-2xl p-5 border border-slate-800/60 lg:col-span-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-5 border-b border-slate-900/60 pb-4">
                  <div className="p-2 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20">
                    <FiArrowUpRight className="w-3.5 h-3.5 text-neon-cyan" />
                  </div>
                  <div className="font-mono">
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Trade Console</p>
                    <h3 className="text-[10px] font-black text-slate-100 uppercase tracking-wider mt-0.5">Order Entry Terminal</h3>
                  </div>
                </div>

                <form onSubmit={handleTradeSubmit} className="space-y-4 font-mono text-[9px] tracking-wide">
                  
                  {/* Select Ticker */}
                  <div>
                    <label className="text-slate-500 font-black uppercase tracking-wider block mb-1.5">Asset Ticker</label>
                    <select
                      value={selectedStockId}
                      onChange={(e) => setSelectedStockId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-slate-200 focus:outline-none focus:border-neon-cyan/40 text-[10px]"
                    >
                      {allStocks.map(s => (
                        <option key={s.symbol} value={s.symbol}>
                          {s.symbol} - {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Buy / Sell toggle switches */}
                  <div>
                    <label className="text-slate-500 font-black uppercase tracking-wider block mb-1.5">Order Type</label>
                    <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-900/60 text-[9px] font-black uppercase tracking-widest text-center">
                      <button
                        type="button"
                        onClick={() => setTradeType('buy')}
                        className={`py-2 rounded-lg cursor-pointer transition-all ${
                          tradeType === 'buy' ? 'bg-neon-emerald/15 text-neon-emerald border border-neon-emerald/30' : 'text-slate-500 hover:text-slate-350'
                        }`}
                      >
                        Buy Long
                      </button>
                      <button
                        type="button"
                        onClick={() => setTradeType('sell')}
                        className={`py-2 rounded-lg cursor-pointer transition-all ${
                          tradeType === 'sell' ? 'bg-neon-rose/15 text-neon-rose border border-neon-rose/30' : 'text-slate-500 hover:text-slate-350'
                        }`}
                      >
                        Sell Short
                      </button>
                    </div>
                  </div>

                  {/* Buy Price Input */}
                  {tradeType === 'buy' && (
                    <div>
                      <label className="text-slate-500 font-black uppercase tracking-wider block mb-1.5">Purchase price ({currencySymbol})</label>
                      <input
                        type="number"
                        step="0.01"
                        value={priceInput}
                        onChange={(e) => setPriceInput(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-slate-200 focus:outline-none focus:border-neon-cyan/40 text-[10px]"
                      />
                    </div>
                  )}

                  {/* Shares Quantity */}
                  <div>
                    <label className="text-slate-500 font-black uppercase tracking-wider block mb-1.5">Share Quantity</label>
                    <input
                      type="number"
                      value={sharesInput}
                      onChange={(e) => setSharesInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-slate-200 focus:outline-none focus:border-neon-cyan/40 text-[10px]"
                    />
                  </div>

                  {/* Est Cost / Total value */}
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900 font-mono flex items-center justify-between">
                    <span className="text-[7.5px] text-slate-500 font-black uppercase tracking-widest">Estimated Value</span>
                    <span className="text-xs font-black text-slate-200">
                      {formatCurrency(Number(sharesInput || 0) * Number(priceInput || 0), targetStockDetails?.currency)}
                    </span>
                  </div>

                  {/* Messages */}
                  {tradeMessage && (
                    <div className="p-3 bg-neon-emerald/8 border border-neon-emerald/20 text-neon-emerald rounded-xl leading-normal text-[8px] font-mono">
                      {tradeMessage}
                    </div>
                  )}
                  {tradeError && (
                    <div className="p-3 bg-neon-rose/8 border border-neon-rose/20 text-neon-rose rounded-xl leading-normal text-[8px] font-mono">
                      {tradeError}
                    </div>
                  )}

                  {/* Submit Order */}
                  <button
                    type="submit"
                    disabled={isTrading}
                    className={`w-full py-3 rounded-xl cursor-pointer text-[9px] font-black uppercase tracking-widest text-center transition-all ${
                      tradeType === 'buy'
                        ? 'bg-gradient-to-r from-neon-emerald to-emerald-500 text-slate-950 hover:shadow-lg hover:shadow-neon-emerald/25'
                        : 'bg-gradient-to-r from-neon-rose to-rose-600 text-slate-100 hover:shadow-lg hover:shadow-neon-rose/25'
                    }`}
                  >
                    {isTrading ? 'Processing Transaction...' : `Transmit ${tradeType === 'buy' ? 'Buy' : 'Sell'} Order`}
                  </button>

                </form>
              </div>
            </div>

            {/* Right: AI smart engine metrics & Risk profiles */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* AI Buy/Sell recommendation card */}
              {recommendationMetrics && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-2xl p-5 border border-slate-800/60 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-neon-cyan/40 to-transparent" />
                  
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900/60 pb-4 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20">
                        <FiCpu className="w-3.5 h-3.5 text-neon-cyan" />
                      </div>
                      <div className="font-mono">
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">AI Consensus Engine</p>
                        <h3 className="text-[10px] font-black text-slate-100 uppercase tracking-wider mt-0.5">Smart Recommendation Evaluation</h3>
                      </div>
                    </div>

                    {/* Final Verdict Capsule */}
                    <span className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest font-mono shadow-md ${recommendationMetrics.rec.glowClass}`}>
                      {recommendationMetrics.rec.recommendation}
                    </span>
                  </div>

                  {/* Body details */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
                    
                    {/* Explanation */}
                    <div className="md:col-span-3 space-y-3">
                      <h4 className="text-[7.5px] font-black uppercase tracking-widest text-slate-550 font-mono">Neural Decision rationale</h4>
                      <p className="text-[11px] leading-relaxed text-slate-350 font-medium font-sans">
                        "{recommendationMetrics.rec.rationale}"
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <span className="px-2 py-1 rounded bg-slate-950 border border-slate-900 text-[8px] font-mono text-slate-400">
                          Signal Factor Score: {recommendationMetrics.rec.score?.toFixed(1) || '0.0'}
                        </span>
                        <span className="px-2 py-1 rounded bg-slate-950 border border-slate-900 text-[8px] font-mono text-slate-400">
                          Active: {selectedStockId}
                        </span>
                      </div>
                    </div>

                    {/* Synthesis Factors */}
                    <div className="md:col-span-2 bg-slate-950/60 border border-slate-900/60 rounded-xl p-3.5 font-mono text-[8px] flex flex-col justify-center gap-3">
                      <h4 className="text-[7.5px] font-black uppercase tracking-widest text-slate-500 text-center">Synthesis Factors</h4>
                      <div className="space-y-2.5">
                        {recommendationMetrics.rec.factors.map((f, i) => (
                          <div key={i} className="flex justify-between items-center">
                            <span className="text-slate-500 uppercase tracking-wider font-bold">{f.name}</span>
                            <span className="text-slate-200 font-extrabold text-[9px]">{f.signal}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}

              {/* Risk Analysis Card */}
              {recommendationMetrics && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-2xl p-5 border border-slate-800/60 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-neon-cyan/40 to-transparent" />
                  
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-slate-900/60 pb-4 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20">
                        <FiShield className="w-3.5 h-3.5 text-neon-cyan" />
                      </div>
                      <div className="font-mono">
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Risk Assessment</p>
                        <h3 className="text-[10px] font-black text-slate-100 uppercase tracking-wider mt-0.5">Asset Volatility Analytics</h3>
                      </div>
                    </div>

                    {/* Risk Badge */}
                    <span className={`px-3 py-1.5 rounded-lg text-[9px] font-mono font-black uppercase tracking-widest border ${recommendationMetrics.risk.riskColor}`}>
                      Risk Category: {recommendationMetrics.risk.riskBadge}
                    </span>
                  </div>

                  {/* Factors grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {recommendationMetrics.risk.factors.map((rf, i) => (
                      <div key={i} className="bg-slate-950/65 rounded-xl p-3 border border-slate-900/60 font-mono">
                        <span className="text-[7px] text-slate-500 font-black uppercase tracking-wider block mb-1.5">{rf.name}</span>
                        <span className="text-[10.5px] font-black text-slate-200 block mb-1">{rf.value}</span>
                        <span className="text-[7.5px] text-slate-450 leading-relaxed font-bold block">{rf.status || 'Stable'}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

            </div>
          </motion.div>
        )}

        {/* TAB 3: PROJECTION CALCULATOR & TIME-SERIES EXPECTED OUTCOMES */}
        {activeTab === 'simulator' && (
          <motion.div
            key="sim-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            {/* Input and timeframe options */}
            <div className="glass-card rounded-2xl p-5 border border-slate-800/60 relative">
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-neon-cyan/40 to-transparent" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-mono text-[9px] tracking-wide items-end">
                {/* Select Asset */}
                <div>
                  <label className="text-slate-500 font-black uppercase tracking-wider block mb-1.5">Asset Under Modeling</label>
                  <select
                    value={selectedStockId}
                    onChange={(e) => setSelectedStockId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-slate-200 focus:outline-none focus:border-neon-cyan/40 text-[10px]"
                  >
                    {allStocks.map(s => (
                      <option key={s.symbol} value={s.symbol}>
                        {s.symbol} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Investment Capital */}
                <div>
                  <label className="text-slate-500 font-black uppercase tracking-wider block mb-1.5">Simulated Capital Principal</label>
                  <input
                    type="number"
                    value={simAmount}
                    onChange={(e) => setSimAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-slate-200 focus:outline-none focus:border-neon-cyan/40 text-[10px]"
                  />
                </div>

                {/* Duration select */}
                <div>
                  <label className="text-slate-500 font-black uppercase tracking-wider block mb-1.5">Simulation Horizon Duration</label>
                  <div className="grid grid-cols-4 gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-900/60 text-[8.5px] font-black uppercase tracking-wider text-center">
                    {[
                      { id: '1', label: '1 Mo' },
                      { id: '3', label: '3 Mo' },
                      { id: '6', label: '6 Mo' },
                      { id: '12', label: '1 Yr' }
                    ].map(d => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setSimTimeframe(d.id)}
                        className={`py-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                          simTimeframe === d.id ? 'bg-gradient-to-r from-neon-cyan to-neon-purple text-slate-950 font-black' : 'text-slate-500 hover:text-slate-350'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Results Grid Cases */}
            {simulatedResults && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
                {[
                  {
                    title: 'Worst Case Scenario',
                    desc: 'Corresponds to a -1.5 Standard Deviation downside volatility drift. Used for conservative capital protection modeling.',
                    value: simulatedResults.worst.value,
                    profit: simulatedResults.worst.profit,
                    percent: simulatedResults.worst.percent,
                    color: simulatedResults.worst.profit >= 0 ? 'text-neon-emerald' : 'text-neon-rose',
                    glow: simulatedResults.worst.profit >= 0 ? 'rgba(0,255,102,0.05)' : 'rgba(255,45,85,0.05)',
                    badgeColor: simulatedResults.worst.profit >= 0 ? 'text-neon-emerald bg-neon-emerald/8 border-neon-emerald/20' : 'text-neon-rose bg-neon-rose/8 border-neon-rose/20',
                    border: 'border-slate-800/80',
                    badge: simulatedResults.worst.profit >= 0 ? 'Net Gain' : 'Net Loss'
                  },
                  {
                    title: 'Expected Case Scenario',
                    desc: 'Median projection integrating base market returns, RandomForest neural forecasts, and positive/negative media trends.',
                    value: simulatedResults.expected.value,
                    profit: simulatedResults.expected.profit,
                    percent: simulatedResults.expected.percent,
                    color: simulatedResults.expected.profit >= 0 ? 'text-neon-emerald' : 'text-neon-rose',
                    glow: 'rgba(0,240,255,0.05)',
                    badgeColor: 'text-neon-cyan bg-neon-cyan/8 border-neon-cyan/20',
                    border: 'border-neon-cyan/25',
                    badge: 'Median Forecast'
                  },
                  {
                    title: 'Best Case Scenario',
                    desc: 'Favorable scenario modeling a +1.5 Standard Deviation momentum breakout. Idealized maximum yield outcome.',
                    value: simulatedResults.best.value,
                    profit: simulatedResults.best.profit,
                    percent: simulatedResults.best.percent,
                    color: simulatedResults.best.profit >= 0 ? 'text-neon-emerald' : 'text-neon-rose',
                    glow: 'rgba(188,52,250,0.05)',
                    badgeColor: 'text-neon-purple bg-neon-purple/8 border-neon-purple/20',
                    border: 'border-slate-800/80',
                    badge: 'Max Breakout'
                  }
                ].map((scenario, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.45 }}
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                    className="glass-card rounded-2xl p-5 border flex flex-col justify-between overflow-hidden relative group"
                    style={{
                      borderColor: scenario.border.includes('cyan') ? 'rgba(0,240,255,0.2)' : 'rgba(32,43,61,0.6)',
                      boxShadow: `0 8px 30px -4px ${scenario.glow}, 0 2px 10px rgba(0,0,0,0.4)`
                    }}
                  >
                    <div className="relative">
                      {/* Top Row header */}
                      <div className="flex items-start justify-between mb-3.5">
                        <span className="text-[10px] font-black text-slate-100 uppercase tracking-wider block">{scenario.title}</span>
                        <span className={`text-[7.5px] font-black uppercase tracking-widest font-mono border px-2 py-0.5 rounded-full ${scenario.badgeColor}`}>
                          {scenario.badge}
                        </span>
                      </div>

                      <p className="text-[8.5px] text-slate-500 font-medium font-sans leading-relaxed mb-4">
                        {scenario.desc}
                      </p>

                      {/* Math outputs */}
                      <div className="space-y-3.5 pt-4 border-t border-slate-900/40">
                        {/* Final simulated value */}
                        <div>
                          <span className="text-[7.5px] text-slate-650 font-black uppercase tracking-widest block mb-1">Simulated Valuation</span>
                          <span className="text-lg font-black text-slate-100 tracking-tight block">
                            {formatCurrency(scenario.value, targetStockDetails?.currency)}
                          </span>
                        </div>

                        {/* Profit or loss change */}
                        <div className="flex justify-between items-center text-[9px] bg-slate-950/45 border border-slate-900 p-2.5 rounded-xl">
                          <div>
                            <span className="text-[7px] text-slate-600 font-bold uppercase tracking-wider block mb-0.5">Projected P&L</span>
                            <span className={`font-black ${scenario.color}`}>
                              {scenario.profit >= 0 ? '+' : ''}{formatCurrency(scenario.profit, targetStockDetails?.currency)}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[7px] text-slate-600 font-bold uppercase tracking-wider block mb-0.5">ROI Yield</span>
                            <span className={`font-black ${scenario.color}`}>
                              {scenario.percent >= 0 ? '+' : ''}{scenario.percent.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
