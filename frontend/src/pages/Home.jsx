import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/formatters';
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiCpu, 
  FiShield, 
  FiArrowRight, 
  FiActivity, 
  FiSearch, 
  FiLayers, 
  FiBookmark, 
  FiMessageSquare,
  FiTerminal,
  FiCheck,
  FiCornerDownRight,
  FiGithub,
  FiTwitter,
  FiLinkedin,
  FiGlobe,
  FiDatabase,
  FiPieChart,
  FiBarChart2,
  FiCrosshair
} from 'react-icons/fi';
import { motion, AnimatePresence, useInView, useMotionValue, useTransform, animate } from 'framer-motion';

// Animated Counter Component for the Performance Section
const Counter = ({ from = 0, to, duration = 2, delay = 0, suffix = '' }) => {
  const nodeRef = useRef(null);
  const inView = useInView(nodeRef, { once: true, margin: "-100px" });
  const count = useMotionValue(from);
  const rounded = useTransform(count, (latest) => {
    // If it has decimals, keep 1 decimal
    if (to % 1 !== 0) return latest.toFixed(1) + suffix;
    return Math.round(latest) + suffix;
  });

  useEffect(() => {
    if (inView) {
      const controls = animate(count, to, { duration: duration, delay: delay, ease: "easeOut" });
      return controls.stop;
    }
  }, [inView, count, to, duration, delay]);

  return <motion.span ref={nodeRef}>{rounded}</motion.span>;
};

export default function Home() {
  const [selectedDemoSymbol, setSelectedDemoSymbol] = useState('AAPL');
  const [demoSearchQuery, setDemoSearchQuery] = useState('');
  const [demoLoading, setDemoLoading] = useState(false);

  const demoStockDatabase = {
    AAPL: { signal: 'BUY / BULLISH', confidence: 87, sentiment: 'Positive (84%)', returnPct: '+8.69%', price: 182.63, sparkline: [178, 179.5, 178.1, 180.5, 182.63] },
    NVDA: { signal: 'BUY / BULLISH', confidence: 94, sentiment: 'Highly Positive (95%)', returnPct: '+7.41%', price: 875.12, sparkline: [830, 845, 840, 852.6, 875.12] },
    TSLA: { signal: 'HOLD / NEUTRAL', confidence: 52, sentiment: 'Mixed (50%)', returnPct: '+0.38%', price: 175.34, sparkline: [173.8, 172.9, 176.4, 174.1, 175.34] },
    MSFT: { signal: 'BUY / BULLISH', confidence: 91, sentiment: 'Bullish (92%)', returnPct: '+4.69%', price: 415.50, sparkline: [405, 408, 407, 410, 415.50] },
    GOOGL: { signal: 'SELL / BEARISH', confidence: 68, sentiment: 'Bearish (42%)', returnPct: '-5.82%', price: 147.60, sparkline: [151.2, 150.3, 149.9, 148.8, 147.60] }
  };

  const handleDemoSelect = (sym) => {
    setDemoLoading(true);
    setTimeout(() => {
      setSelectedDemoSymbol(sym);
      setDemoLoading(false);
    }, 400);
  };

  const handleDemoSearchSubmit = (e) => {
    e.preventDefault();
    const cleanSym = demoSearchQuery.toUpperCase().trim();
    if (demoStockDatabase[cleanSym]) {
      handleDemoSelect(cleanSym);
      setDemoSearchQuery('');
    } else {
      alert('Demo supports AAPL, NVDA, TSLA, MSFT, and GOOGL.');
    }
  };

  const currentDemo = demoStockDatabase[selectedDemoSymbol];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-neon-cyan/25 selection:text-neon-cyan overflow-hidden relative">
      {/* Background Mesh Grids & Glows */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgwek0zOSAzOUgxVjFoMzh2MzhaIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDIpIi8+PC9zdmc+')] opacity-50 z-0 pointer-events-none" />
      <div className="glow-cyan -top-40 -left-40 z-0 opacity-40 w-[600px] h-[600px]" />
      <div className="glow-purple top-1/3 -right-20 z-0 opacity-40 w-[500px] h-[500px]" />
      
      {/* Particles */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-neon-cyan/40 rounded-full blur-[1px]"
            initial={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), 
              y: Math.random() * 1000,
              opacity: Math.random() * 0.5 + 0.1
            }}
            animate={{
              y: [null, Math.random() * -100 - 50],
              opacity: [null, 0]
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* 1. Navbar */}
      <nav className="sticky top-0 z-50 glass-nav border-b border-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-neon-cyan to-neon-purple flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.3)]">
              <span className="font-extrabold text-slate-950 text-base font-mono">α</span>
            </div>
            <Link to="/" className="text-sm font-black tracking-widest text-slate-100 font-mono">
              ALPHA<span className="text-neon-cyan">STOCK</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-8 text-[10px] font-black font-mono uppercase tracking-widest text-slate-400">
            <a href="#features" className="hover:text-neon-cyan transition-colors duration-300">Features</a>
            <a href="#how-it-works" className="hover:text-neon-cyan transition-colors duration-300">Pipeline</a>
            <a href="#markets" className="hover:text-neon-cyan transition-colors duration-300">Markets</a>
            <a href="#performance" className="hover:text-neon-cyan transition-colors duration-300">Performance</a>
          </div>

          <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-widest font-black">
            <Link to="/login" className="hidden sm:block text-slate-400 hover:text-white transition-colors duration-300">
              Sign In
            </Link>
            <Link to="/register" className="glow-btn-primary px-5 py-2 shadow-lg shadow-neon-cyan/20">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section id="home" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[90vh]">
        {/* Left Columns - Copy */}
        <div className="lg:col-span-6 space-y-8 text-left z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan font-mono shadow-[0_0_20px_rgba(0,240,255,0.15)]">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
              <span>AI-Powered Market Intelligence</span>
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] bg-gradient-to-br from-white via-slate-100 to-slate-500 bg-clip-text text-transparent"
          >
            Predict Smarter.<br />Trade Better.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-sm sm:text-base text-slate-400 max-w-lg leading-relaxed font-sans font-medium"
          >
            Advanced AI-driven stock prediction platform using machine learning, technical analysis, and market sentiment to deliver institutional-grade forecasting.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-5 font-mono text-[10px] uppercase tracking-widest font-black pt-2"
          >
            <Link to="/register" className="relative group px-8 py-4 bg-slate-100 text-slate-950 rounded-xl overflow-hidden hover:scale-[1.02] transition-transform duration-300 text-center shadow-[0_0_30px_rgba(255,255,255,0.15)]">
              <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan via-white to-neon-purple opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                Get Started <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <a href="#demo" className="px-8 py-4 bg-slate-900/60 text-slate-300 border border-slate-800 rounded-xl hover:bg-slate-800 hover:text-white transition-all duration-300 text-center shadow-lg backdrop-blur-md">
              Live Demo
            </a>
          </motion.div>
        </div>

        {/* Right Columns - Futuristic Hero Visual */}
        <div className="lg:col-span-6 relative h-[500px] w-full flex items-center justify-center perspective-1000">
          <motion.div
            initial={{ opacity: 0, rotateY: 10, scale: 0.9 }}
            animate={{ opacity: 1, rotateY: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-lg"
          >
            {/* Main Holographic Chart Container */}
            <div className="glass-card rounded-2xl p-6 border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10 overflow-hidden bg-slate-950/80 backdrop-blur-xl">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-emerald" />
              
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                    <FiActivity className="text-neon-cyan" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black font-mono text-white tracking-widest uppercase">NVDA // LONG</h3>
                    <p className="text-[9px] text-slate-500 font-mono tracking-widest">Neural Forecast Matrix</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-neon-emerald font-mono font-black text-xs tracking-widest">+12.4%</p>
                  <p className="text-slate-400 font-mono text-[9px] uppercase">Target Hit</p>
                </div>
              </div>

              {/* Animated Candlestick Chart SVG */}
              <div className="h-40 w-full relative border-b border-slate-800/60 mb-4">
                <svg viewBox="0 0 400 150" className="w-full h-full overflow-visible">
                  {/* Grid */}
                  <line x1="0" y1="50" x2="400" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="0" y1="100" x2="400" y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />
                  
                  {/* Candlesticks */}
                  <g className="animate-pulse-slow">
                    {/* Bear Candle */}
                    <line x1="50" y1="120" x2="50" y2="70" stroke="#ff2d55" strokeWidth="1.5" />
                    <rect x="45" y="80" width="10" height="30" fill="#ff2d55" rx="2" />
                    
                    {/* Bull Candle */}
                    <line x1="100" y1="100" x2="100" y2="40" stroke="#00ff66" strokeWidth="1.5" />
                    <rect x="95" y="45" width="10" height="40" fill="#00ff66" rx="2" />
                    
                    {/* Bear Candle */}
                    <line x1="150" y1="90" x2="150" y2="50" stroke="#ff2d55" strokeWidth="1.5" />
                    <rect x="145" y="60" width="10" height="20" fill="#ff2d55" rx="2" />
                    
                    {/* Bull Candle */}
                    <line x1="200" y1="70" x2="200" y2="20" stroke="#00ff66" strokeWidth="1.5" />
                    <rect x="195" y="30" width="10" height="35" fill="#00ff66" rx="2" />
                    
                    {/* Bull Candle (Current) */}
                    <motion.g
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 1, delay: 0.5 }}
                    >
                      <line x1="250" y1="40" x2="250" y2="0" stroke="#00f0ff" strokeWidth="2" className="drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
                      <rect x="244" y="5" width="12" height="25" fill="#00f0ff" rx="2" className="drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
                    </motion.g>

                    {/* AI Prediction Curve */}
                    <motion.path 
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 2, delay: 1, ease: "easeInOut" }}
                      d="M 50 90 Q 150 110 250 20 T 350 10" 
                      fill="none" 
                      stroke="url(#aiGradient)" 
                      strokeWidth="3" 
                      strokeLinecap="round" 
                      strokeDasharray="6 6"
                      className="drop-shadow-[0_0_10px_rgba(188,52,250,0.5)]"
                    />
                    
                    {/* Prediction Target Node */}
                    <motion.circle 
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.5, 1] }}
                      transition={{ duration: 0.5, delay: 3 }}
                      cx="350" cy="10" r="5" fill="#00f0ff" 
                      className="drop-shadow-[0_0_12px_rgba(0,240,255,1)]"
                    />
                  </g>
                  
                  <defs>
                    <linearGradient id="aiGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#bc34fa" />
                      <stop offset="100%" stopColor="#00f0ff" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Stats Footer */}
              <div className="flex justify-between items-center font-mono text-[9px] uppercase tracking-widest text-slate-400">
                <div className="flex items-center gap-2">
                  <FiCpu className="text-neon-purple" />
                  <span>LSTM Neural Engine</span>
                </div>
                <div>Status: <span className="text-neon-cyan font-black">ACTIVE</span></div>
              </div>
            </div>

            {/* Floating Market Stats Widget */}
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-8 -left-8 glass-card rounded-xl p-4 shadow-2xl border-neon-emerald/30 z-20 font-mono flex items-center gap-4 bg-slate-950/90"
            >
              <div className="w-10 h-10 rounded-lg bg-neon-emerald/20 text-neon-emerald flex items-center justify-center">
                <FiTrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[8px] text-slate-500 uppercase tracking-widest font-black mb-1">Buy Signal Detected</p>
                <p className="text-xs text-white font-black tracking-wider">Confidence: 94.2%</p>
              </div>
            </motion.div>

            {/* Floating Sentiment Widget */}
            <motion.div
              animate={{ y: [10, -10, 10] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -top-10 -right-10 glass-card rounded-xl p-4 shadow-2xl border-neon-purple/30 z-20 font-mono flex flex-col gap-2 bg-slate-950/90"
            >
              <p className="text-[8px] text-slate-500 uppercase tracking-widest font-black flex items-center gap-1.5">
                <FiMessageSquare className="text-neon-purple" />
                Sentiment Engine
              </p>
              <div className="flex items-end gap-2">
                <p className="text-lg text-white font-black leading-none">88<span className="text-[10px] text-slate-400">%</span></p>
                <p className="text-[9px] text-neon-purple uppercase font-black tracking-widest mb-0.5">Bullish</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 3. Features Section */}
      <section id="features" className="bg-slate-950/40 border-y border-slate-900/60 py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[8px] font-black bg-slate-900 border border-slate-800 text-neon-purple uppercase tracking-widest font-mono"
            >
              PLATFORM CAPABILITIES
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl sm:text-4xl font-black text-slate-100 tracking-tight"
            >
              Institutional-Grade Toolkit
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'AI Stock Prediction',
                icon: <FiCpu className="w-5 h-5" />,
                desc: 'Advanced machine learning models providing multi-day directional forecasts and specific price targets.',
                color: 'cyan'
              },
              {
                title: 'Technical Analysis',
                icon: <FiBarChart2 className="w-5 h-5" />,
                desc: 'Automated calculation of RSI, MACD, Moving Averages, and complex chart patterns instantly.',
                color: 'purple'
              },
              {
                title: 'Market Sentiment AI',
                icon: <FiMessageSquare className="w-5 h-5" />,
                desc: 'Natural language processing scanning news, earnings transcripts, and social flow for sentiment shifts.',
                color: 'emerald'
              },
              {
                title: 'Real-Time Market Data',
                icon: <FiActivity className="w-5 h-5" />,
                desc: 'Sub-second latency pricing feeds ensuring your predictive models operate on the absolute latest data.',
                color: 'cyan'
              },
              {
                title: 'Indian + US Support',
                icon: <FiGlobe className="w-5 h-5" />,
                desc: 'Dual-market architecture natively supporting S&P 500 equities and NSE/BSE Indian listings.',
                color: 'emerald'
              },
              {
                title: 'Portfolio Watchlist',
                icon: <FiBookmark className="w-5 h-5" />,
                desc: 'Premium customizable boards with drag-and-drop mechanics, mini-sparklines, and instant AI badges.',
                color: 'purple'
              }
            ].map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card glass-card-hover rounded-2xl p-6 relative overflow-hidden group border border-slate-800 hover:border-slate-600 transition-colors duration-300"
              >
                <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-neon-${feat.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className={`w-12 h-12 rounded-xl bg-neon-${feat.color}/10 border border-neon-${feat.color}/30 flex items-center justify-center mb-6 text-neon-${feat.color} shadow-[0_0_15px_rgba(var(--color-neon-${feat.color}),0.2)] group-hover:scale-110 transition-transform duration-300`}>
                  {feat.icon}
                </div>
                <h3 className="text-sm font-black font-mono uppercase tracking-widest text-slate-100 mb-3">{feat.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans font-medium">
                  {feat.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. How It Works Section */}
      <section id="how-it-works" className="py-24 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-20">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[8px] font-black bg-slate-900 border border-slate-800 text-neon-emerald uppercase tracking-widest font-mono">
              3-STEP PIPELINE
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-100 tracking-tight">
              From Search to Strategy
            </h2>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Timeline Line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2 hidden md:block" />
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: '100%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-emerald -translate-y-1/2 hidden md:block shadow-[0_0_10px_rgba(0,240,255,0.5)]" 
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
              {[
                { step: '01', title: 'Search Stock', desc: 'Enter any supported US or Indian ticker symbol into the intelligence terminal.', icon: <FiSearch /> },
                { step: '02', title: 'AI Analysis', desc: 'Neural networks digest technicals, historicals, and linguistic sentiment instantly.', icon: <FiDatabase /> },
                { step: '03', title: 'Get Prediction', desc: 'Receive directional targets, statistical confidence, and precise action signals.', icon: <FiCrosshair /> } 
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.3 }}
                  className="relative flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-700 flex items-center justify-center text-xl text-slate-300 mb-6 relative z-10 shadow-xl group hover:border-neon-cyan transition-colors">
                    {i === 2 ? <FiCrosshair className="group-hover:text-neon-cyan transition-colors" /> : <div className="group-hover:text-neon-cyan transition-colors">{item.icon}</div>}
                    <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-slate-800 text-white text-[9px] font-black font-mono flex items-center justify-center border border-slate-600">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-sm font-black font-mono uppercase tracking-widest text-slate-100 mb-3">{item.title}</h3>
                  <p className="text-xs text-slate-400 font-medium px-4">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Market Coverage Section */}
      <section id="markets" className="bg-slate-950/40 border-y border-slate-900/60 py-20 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-center mb-12">
           <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest font-mono">Global Market Coverage</h2>
        </div>

        {/* Ticker Tape */}
        <div className="flex gap-8 whitespace-nowrap overflow-hidden py-4 opacity-80">
          <motion.div 
            animate={{ x: [0, -1000] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="flex gap-8 items-center"
          >
            {[
              { mkt: 'US', sym: 'AAPL', name: 'Apple Inc', price: '182.63', chg: '+1.2%' },
              { mkt: 'US', sym: 'TSLA', name: 'Tesla', price: '175.34', chg: '-0.8%' },
              { mkt: 'US', sym: 'NVDA', name: 'Nvidia', price: '875.12', chg: '+3.4%' },
              { mkt: 'US', sym: 'MSFT', name: 'Microsoft', price: '415.50', chg: '+0.9%' },
              { mkt: 'IN', sym: 'RELIANCE', name: 'Reliance', price: '2950.00', chg: '+1.5%' },
              { mkt: 'IN', sym: 'TCS', name: 'TCS', price: '3890.45', chg: '-0.2%' },
              { mkt: 'IN', sym: 'INFY', name: 'Infosys', price: '1420.30', chg: '+0.5%' },
              { mkt: 'IN', sym: 'HDFCBANK', name: 'HDFC Bank', price: '1450.80', chg: '+1.1%' },
              // Duplicate for seamless scroll
              { mkt: 'US', sym: 'AAPL', name: 'Apple Inc', price: '182.63', chg: '+1.2%' },
              { mkt: 'US', sym: 'TSLA', name: 'Tesla', price: '175.34', chg: '-0.8%' },
              { mkt: 'US', sym: 'NVDA', name: 'Nvidia', price: '875.12', chg: '+3.4%' },
            ].map((t, i) => (
              <div key={i} className="glass-card rounded-xl px-4 py-3 flex items-center gap-4 min-w-[200px] border-slate-800/50">
                <div className={`text-[8px] font-black px-1.5 py-0.5 rounded ${t.mkt === 'US' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                  {t.mkt}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-slate-200 font-mono">{t.sym}</span>
                  <span className="text-[8px] text-slate-500 uppercase tracking-widest">{t.name}</span>
                </div>
                <div className="ml-auto text-right">
                  <span className={`text-[10px] font-black block font-mono ${t.chg.startsWith('+') ? 'text-neon-emerald' : 'text-neon-rose'}`}>
                    {t.chg}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 6. Performance Metrics Section */}
      <section id="performance" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card rounded-3xl p-8 sm:p-12 relative overflow-hidden text-center shadow-2xl border-neon-cyan/20">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-emerald" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neon-cyan/5 via-transparent to-transparent pointer-events-none" />
            
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight uppercase mb-12 relative z-10">
              Systematic Performance
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10 font-mono">
              <div>
                <span className="text-4xl lg:text-5xl font-black text-white block mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                  <Counter to={70.9} suffix="%" duration={2.5} />
                </span>
                <span className="text-[10px] uppercase tracking-widest text-neon-cyan font-black">Model Accuracy</span>
              </div>
              <div>
                <span className="text-4xl lg:text-5xl font-black text-white block mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                  <Counter to={100} suffix="%" duration={2} />
                </span>
                <span className="text-[10px] uppercase tracking-widest text-neon-purple font-black">AI Confidence Engine</span>
              </div>
              <div>
                <span className="text-4xl lg:text-5xl font-black text-white block mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                  <Counter to={2} suffix="+" duration={1.5} />
                </span>
                <span className="text-[10px] uppercase tracking-widest text-neon-emerald font-black">Multi-Market Support</span>
              </div>
              <div>
                <span className="text-4xl lg:text-5xl font-black text-white block mb-2 flex items-center justify-center gap-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                  <FiPieChart className="w-8 h-8 text-slate-400" />
                </span>
                <span className="text-[10px] uppercase tracking-widest text-amber-400 font-black">Tech + Sentiment Fusion</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Testimonials */}
      <section className="bg-slate-950/40 border-y border-slate-900/60 py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-4 mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[8px] font-black bg-slate-900 border border-slate-800 text-neon-cyan uppercase tracking-widest font-mono shadow-[0_0_10px_rgba(0,240,255,0.05)]">
              OPERATIONAL FEEDBACK
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-105 tracking-tight uppercase">Endorsed by Top-Tier Operators</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left text-xs font-medium">
            <div className="glass-card rounded-2xl p-8 flex flex-col justify-between border-slate-800 hover:border-slate-600 transition-colors shadow-xl">
              <p className="text-slate-300 leading-relaxed font-sans mb-8 italic">
                "The deep learning forecasting outputs are surprisingly consistent. Integrating their API into our quantitative execution algorithms saved us hundreds of backtesting hours."
              </p>
              <div className="flex items-center gap-4 font-mono">
                <div className="w-10 h-10 rounded-full bg-slate-900 border border-neon-cyan/50 text-neon-cyan flex items-center justify-center font-black text-[10px]">
                  MC
                </div>
                <div>
                  <span className="block text-xs font-black text-white">Marcus Chen</span>
                  <span className="text-[9px] text-neon-cyan uppercase tracking-widest font-black block mt-0.5">Quant Lead // Nexus Capital</span>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-8 flex flex-col justify-between border-slate-800 hover:border-slate-600 transition-colors shadow-xl">
              <p className="text-slate-300 leading-relaxed font-sans mb-8 italic">
                "Their semantic news sentiment audit modules accurately filter market noise during earnings calls. It provides immediate consensus vectors that match direct flow actions."
              </p>
              <div className="flex items-center gap-4 font-mono">
                <div className="w-10 h-10 rounded-full bg-slate-900 border border-neon-purple/50 text-neon-purple flex items-center justify-center font-black text-[10px]">
                  SR
                </div>
                <div>
                  <span className="block text-xs font-black text-white">Sarah Jenkins</span>
                  <span className="text-[9px] text-neon-purple uppercase tracking-widest font-black block mt-0.5">Macro Trader // Apex Global</span>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-8 flex flex-col justify-between border-slate-800 hover:border-slate-600 transition-colors shadow-xl">
              <p className="text-slate-300 leading-relaxed font-sans mb-8 italic">
                "We consume AlphaStock developer APIs directly within our retail trading terminals. The probability scores provide exceptional confidence when opening long vectors."
              </p>
              <div className="flex items-center gap-4 font-mono">
                <div className="w-10 h-10 rounded-full bg-slate-900 border border-neon-emerald/50 text-neon-emerald flex items-center justify-center font-black text-[10px]">
                  DK
                </div>
                <div>
                  <span className="block text-xs font-black text-white">David Kovacs</span>
                  <span className="text-[9px] text-neon-emerald uppercase tracking-widest font-black block mt-0.5">Founder // SigmaTrade</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
        <div className="glass-card rounded-3xl p-10 sm:p-16 relative overflow-hidden text-center max-w-4xl mx-auto border-slate-700 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-0 bg-gradient-to-tr from-neon-cyan/10 via-slate-950 to-neon-purple/10 pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-8">
            <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight leading-tight">
              Start Predicting Smarter Today
            </h2>
            <p className="text-sm text-slate-400 font-sans font-medium">
              Join systematic investors trading with statistical edge. Access the terminal dashboard instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center font-mono text-[10px] uppercase tracking-widest font-black pt-4">
              <Link to="/register" className="relative group px-10 py-4 bg-white text-slate-950 rounded-xl overflow-hidden hover:scale-[1.02] transition-transform duration-300 w-full sm:w-auto shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                <span className="relative z-10">Launch Dashboard</span>
              </Link>
              <a href="#demo" className="px-10 py-4 bg-slate-900/60 text-slate-300 border border-slate-700 rounded-xl hover:bg-slate-800 hover:text-white transition-colors duration-300 w-full sm:w-auto">
                Try AI Predictor
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 text-slate-400 py-12 px-4 sm:px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
          {/* Brand & Stack */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-neon-cyan to-neon-purple flex items-center justify-center">
                <span className="font-extrabold text-slate-950 text-base font-mono">α</span>
              </div>
              <span className="text-sm font-black tracking-widest text-slate-200 font-mono">
                ALPHA<span className="text-neon-cyan">STOCK</span>
              </span>
            </div>
            <p className="text-[9px] font-mono uppercase tracking-widest text-slate-500 font-black">
              Built using MERN + Flask + XGBoost + Machine Learning
            </p>
          </div>

          {/* Social */}
          <div className="flex items-center gap-3">
            <a href="#" className="p-2.5 bg-slate-900 rounded-lg hover:bg-slate-800 hover:text-neon-cyan transition-colors border border-slate-800" title="Github">
              <FiGithub className="w-4 h-4" />
            </a>
            <a href="#" className="p-2.5 bg-slate-900 rounded-lg hover:bg-slate-800 hover:text-neon-cyan transition-colors border border-slate-800" title="LinkedIn">
              <FiLinkedin className="w-4 h-4" />
            </a>
            <a href="#" className="p-2.5 bg-slate-900 rounded-lg hover:bg-slate-800 hover:text-neon-cyan transition-colors border border-slate-800" title="Contact">
              <FiMessageSquare className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-900/60 pt-6 flex justify-between items-center text-[8px] font-mono font-black text-slate-600 uppercase tracking-widest">
          <span>&copy; {new Date().getFullYear()} ALPHA_STOCK AI.</span>
          <span>SYSTEM VER: 2.1.0</span>
        </div>
      </footer>
    </div>
  );
}
