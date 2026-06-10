import React from 'react';
import { useStock } from '../context/StockContext';
import { formatCurrency } from '../utils/formatters';
import { FiTrendingUp, FiTrendingDown, FiAlertCircle, FiCpu, FiMessageSquare, FiCompass } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function PredictionCard() {
  const { currentStock } = useStock();
  const { aiPrediction, price, symbol } = currentStock;

  const getDirectionDetails = () => {
    switch (aiPrediction.direction) {
      case 'bullish':
        return {
          bg: 'border-neon-emerald/20 hover:border-neon-emerald/30 shadow-neon-emerald/5',
          text: 'text-neon-emerald',
          indicator: 'STRONG BUY / BULLISH',
          icon: FiTrendingUp
        };
      case 'bearish':
        return {
          bg: 'border-neon-rose/20 hover:border-neon-rose/30 shadow-neon-rose/5',
          text: 'text-neon-rose',
          indicator: 'STRONG SELL / BEARISH',
          icon: FiTrendingDown
        };
      default:
        return {
          bg: 'border-amber-500/20 hover:border-amber-500/30 shadow-amber-500/5',
          text: 'text-amber-400',
          indicator: 'HOLD / NEUTRAL',
          icon: FiAlertCircle
        };
    }
  };

  const config = getDirectionDetails();
  const DirectionIcon = config.icon;
  const projectedReturn = ((aiPrediction.targetPrice - price) / price) * 100;

  return (
    <div className={`glass-card glass-card-hover rounded-2xl p-5 border shadow-xl relative overflow-hidden ${config.bg}`}>
      {/* Top micro light bar for direction */}
      <div className={`absolute top-0 left-0 right-0 h-[1.5px] ${
        aiPrediction.direction === 'bullish' ? 'bg-neon-emerald' : aiPrediction.direction === 'bearish' ? 'bg-neon-rose' : 'bg-amber-500'
      }`} />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-slate-950 border border-slate-900 text-neon-cyan">
            <FiCpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-100 text-xs sm:text-sm font-mono uppercase tracking-wider">Predictive Signals</h3>
            <p className="text-4xs text-slate-550 uppercase tracking-widest font-mono font-bold mt-0.5">ENGINE: DEEPAR-LSTM-V4</p>
          </div>
        </div>

        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-4xs font-extrabold font-mono tracking-widest bg-slate-950 border border-slate-850/80 ${config.text}`}>
          <DirectionIcon className="w-3.5 h-3.5" />
          <span>{config.indicator}</span>
        </div>
      </div>

      {/* Grid forecast targets */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-900/60 relative group/target">
          <span className="text-4xs font-bold uppercase tracking-widest text-slate-500 font-mono block mb-1">AI Target Price</span>
          <span className="text-base sm:text-lg font-bold font-mono text-slate-100 tracking-tight">
            {formatCurrency(aiPrediction.targetPrice)}
          </span>
          <span className="text-4xs text-slate-400 font-mono block mt-1">Horizon: {aiPrediction.forecastDays}D Vector</span>
        </div>

        <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-900/60">
          <span className="text-4xs font-bold uppercase tracking-widest text-slate-500 font-mono block mb-1">Forecast Return</span>
          <span className={`text-base sm:text-lg font-bold font-mono tracking-tight block ${projectedReturn >= 0 ? 'text-neon-emerald' : 'text-neon-rose'}`}>
            {projectedReturn >= 0 ? '+' : ''}{projectedReturn.toFixed(2)}%
          </span>
          <span className="text-4xs text-slate-450 font-mono block mt-1">Projected net change</span>
        </div>
      </div>

      {/* Algorithmic metrics list */}
      <div className="space-y-3 mb-6">
        <h4 className="text-4xs font-bold text-slate-500 uppercase tracking-widest font-mono">Core Indicators</h4>
        <div className="grid grid-cols-2 gap-2 text-3xs font-mono">
          <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-900/60 flex justify-between">
            <span className="text-slate-500">M. Averaging:</span>
            <span className="font-bold text-slate-200">{aiPrediction.signals.movingAverage}</span>
          </div>
          <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-900/60 flex justify-between">
            <span className="text-slate-500">RSI Indicator:</span>
            <span className="font-bold text-slate-200">{aiPrediction.signals.rsi}</span>
          </div>
          <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-900/60 flex justify-between">
            <span className="text-slate-500">MACD Cross:</span>
            <span className="font-bold text-slate-200">{aiPrediction.signals.macd}</span>
          </div>
          <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-900/60 flex justify-between">
            <span className="text-slate-500">Global Sentiment:</span>
            <span className="font-bold text-slate-200">{aiPrediction.signals.newsSentiment}</span>
          </div>
        </div>
      </div>

      {/* AI Synthesis */}
      <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-900 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 font-bold mb-2 uppercase text-4xs tracking-widest font-mono">
          <FiCompass className="w-3.5 h-3.5 text-neon-cyan" />
          <span>Synthesis & Rationale</span>
        </div>
        <p className="text-slate-300 leading-relaxed font-sans text-2xs sm:text-xs">{aiPrediction.reasoning}</p>
      </div>
    </div>
  );
}
