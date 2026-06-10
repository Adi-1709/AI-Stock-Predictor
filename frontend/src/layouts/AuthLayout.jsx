import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiActivity, FiShield, FiCpu, FiTrendingUp } from 'react-icons/fi';

export default function AuthLayout() {
  const location = useLocation();
  const isRegister = location.pathname === '/register';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans overflow-hidden relative">
      
      {/* Background Mesh Grid */}
      <div className="absolute inset-0 grid-mesh opacity-20 pointer-events-none z-0" />
      
      {/* Left Panel - Premium Fintech Illustration (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900/40 border-r border-slate-800/60 overflow-hidden items-center justify-center p-12 perspective-1000">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 via-transparent to-neon-purple/5" />
        <div className="glow-cyan -top-20 -left-20 opacity-30 z-0" />
        <div className="glow-purple bottom-10 right-10 opacity-30 z-0" />

        {/* Floating Brand */}
        <div className="absolute top-8 left-8 flex items-center gap-2.5 z-20">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-neon-cyan to-neon-purple flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.3)]">
            <span className="font-extrabold text-slate-950 text-xl font-mono">α</span>
          </div>
          <span className="text-xl font-black tracking-widest text-white font-mono">
            ALPHA<span className="text-neon-cyan">STOCK</span>
          </span>
        </div>

        {/* Animated Candlestick Hologram */}
        <motion.div 
          initial={{ opacity: 0, rotateY: -15, scale: 0.9 }}
          animate={{ opacity: 1, rotateY: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative w-full max-w-lg z-10"
        >
          {/* Main Chart Card */}
          <div className="glass-card rounded-2xl p-6 border-slate-700/60 shadow-[0_30px_60px_rgba(0,0,0,0.6)] relative z-10 bg-slate-950/80 backdrop-blur-xl">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-neon-cyan">
                  <FiActivity />
                </div>
                <div>
                  <h3 className="text-xs font-black font-mono text-white tracking-widest uppercase">Neural Engine</h3>
                  <p className="text-[9px] text-slate-500 font-mono tracking-widest">Live Market Scanning</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-neon-emerald">
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-emerald animate-pulse" />
                  <p className="font-mono font-black text-xs tracking-widest">ACTIVE</p>
                </div>
              </div>
            </div>

            {/* SVG Candlestick Graphic */}
            <div className="h-40 w-full relative border-b border-slate-800/60 mb-4 overflow-hidden">
              <svg viewBox="0 0 400 150" className="w-full h-full">
                <line x1="0" y1="50" x2="400" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="100" x2="400" y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />
                
                <g className="animate-pulse-slow">
                  <line x1="50" y1="120" x2="50" y2="70" stroke="#ff2d55" strokeWidth="1.5" />
                  <rect x="45" y="80" width="10" height="30" fill="#ff2d55" rx="2" />
                  <line x1="120" y1="100" x2="120" y2="40" stroke="#00ff66" strokeWidth="1.5" />
                  <rect x="115" y="45" width="10" height="40" fill="#00ff66" rx="2" />
                  <line x1="190" y1="80" x2="190" y2="30" stroke="#00ff66" strokeWidth="1.5" />
                  <rect x="185" y="35" width="10" height="30" fill="#00ff66" rx="2" />
                  
                  <motion.g initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5 }}>
                    <line x1="260" y1="50" x2="260" y2="10" stroke="#00f0ff" strokeWidth="2" className="drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
                    <rect x="254" y="15" width="12" height="25" fill="#00f0ff" rx="2" className="drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
                  </motion.g>
                </g>

                <motion.path 
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 2, delay: 1, ease: "easeInOut" }}
                  d="M 50 90 Q 150 110 260 30 T 380 20" 
                  fill="none" 
                  stroke="url(#authGradient)" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  className="drop-shadow-[0_0_10px_rgba(188,52,250,0.5)]"
                />
                <defs>
                  <linearGradient id="authGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#bc34fa" />
                    <stop offset="100%" stopColor="#00f0ff" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Floating Trust Badges */}
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-6 -left-6 glass-card rounded-xl p-3 shadow-2xl border-neon-cyan/20 z-20 flex items-center gap-3 bg-slate-950/90"
          >
            <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 text-neon-cyan flex items-center justify-center">
              <FiShield className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[8px] text-slate-500 uppercase tracking-widest font-black mb-0.5">Security</p>
              <p className="text-xs text-white font-black tracking-wider">Bank-Grade Encryption</p>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [10, -10, 10] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -top-6 -right-6 glass-card rounded-xl p-3 shadow-2xl border-neon-purple/20 z-20 flex items-center gap-3 bg-slate-950/90"
          >
            <div className="w-8 h-8 rounded-lg bg-neon-purple/10 text-neon-purple flex items-center justify-center">
              <FiCpu className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[8px] text-slate-500 uppercase tracking-widest font-black mb-0.5">Intelligence</p>
              <p className="text-xs text-white font-black tracking-wider">AI Powered</p>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Decorative Quote */}
        <div className="absolute bottom-12 text-center w-full max-w-sm">
          <p className="text-sm text-slate-400 italic font-medium leading-relaxed">
            "Institutional-grade predictive models now accessible for modern quantitative traders."
          </p>
        </div>
      </div>

      {/* Right Panel - Form (Centered on mobile, right half on desktop) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10">
        
        {/* Mobile Header Brand (Only visible on mobile) */}
        <div className="absolute top-6 left-6 lg:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-neon-cyan to-neon-purple flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            <span className="font-extrabold text-slate-950 text-base font-mono">α</span>
          </div>
          <span className="text-sm font-black tracking-widest text-white font-mono">
            ALPHA<span className="text-neon-cyan">STOCK</span>
          </span>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md relative"
        >
          <div className="mb-10">
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">
              {location.pathname === '/forgot-password' ? 'Reset Password' : isRegister ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-sm text-slate-400 font-medium">
              {location.pathname === '/forgot-password' 
                ? 'Enter your email to receive recovery instructions.' 
                : isRegister 
                  ? 'Join the next generation of AI-driven market forecasting.' 
                  : 'Enter your credentials to access the intelligence terminal.'}
            </p>
          </div>

          {/* Renders Login, Register, or ForgotPassword */}
          <Outlet />

          <div className="mt-8 text-center">
            <Link to="/" className="text-[10px] text-slate-500 hover:text-white transition-colors duration-300 uppercase tracking-widest font-black font-mono">
              ← BACK TO HOME
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
