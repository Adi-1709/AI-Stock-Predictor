import React from 'react';
import { useStock } from '../context/StockContext';
import { FiShield } from 'react-icons/fi';

export default function ConfidenceMeter() {
  const { currentStock } = useStock();
  const { aiPrediction } = currentStock;
  const confidence = aiPrediction.confidence;

  const getColors = () => {
    if (confidence >= 85) return { stroke: 'stroke-neon-emerald', text: 'text-neon-emerald', bg: 'bg-neon-emerald/10' };
    if (confidence >= 70) return { stroke: 'stroke-neon-cyan', text: 'text-neon-cyan', bg: 'bg-neon-cyan/10' };
    return { stroke: 'stroke-amber-500', text: 'text-amber-450', bg: 'bg-amber-500/10' };
  };

  const colors = getColors();

  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (confidence / 100) * circumference;

  return (
    <div className="glass-card glass-card-hover rounded-2xl p-5 sm:p-6 flex flex-col items-center justify-between shadow-xl relative overflow-hidden group">
      {/* Glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/0 to-neon-cyan/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="w-full flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
        <h4 className="text-xs sm:text-sm font-extrabold text-slate-200 tracking-wider uppercase font-mono">Prediction Probability</h4>
        <span className="text-4xs bg-slate-950 px-2 py-0.5 rounded-full text-slate-500 border border-slate-900 font-mono font-bold tracking-wider">NEURAL BIAS</span>
      </div>

      <div className="relative flex items-center justify-center my-3">
        {/* Dynamic Glow */}
        <div className={`absolute w-28 h-28 ${colors.bg} rounded-full blur-2xl animate-pulse opacity-75`} />

        {/* Circular Dial SVG */}
        <svg className="w-32 h-32 transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r={radius}
            className="stroke-slate-900"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="64"
            cy="64"
            r={radius}
            className={`transition-all duration-1000 ease-out ${colors.stroke}`}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        {/* Radial Percent */}
        <div className="absolute text-center">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono tracking-tighter">
            {confidence}%
          </span>
          <span className="block text-4xs font-bold text-slate-500 uppercase tracking-widest mt-0.5 font-mono">
            entropy score
          </span>
        </div>
      </div>

      {/* Rationale detail */}
      <div className="w-full bg-slate-950/60 rounded-xl p-3 border border-slate-900 text-left space-y-1.5 mt-3">
        <div className="flex items-center gap-1.5 text-4xs font-bold text-slate-500 uppercase tracking-widest font-mono">
          <FiShield className="w-3.5 h-3.5 text-neon-cyan" />
          <span>Failsafe Integrity</span>
        </div>
        <p className="text-2xs text-slate-450 leading-normal font-sans">
          Measures current model uncertainty ratios. Scores exceeding <span className="text-neon-emerald font-semibold font-mono">85%</span> indicate technical divergence confirmation.
        </p>
      </div>
    </div>
  );
}
