import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiAlertTriangle, FiArrowLeft, FiGrid } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background patterns */}
      <div className="absolute inset-0 grid-mesh opacity-25 pointer-events-none" />
      <div className="glow-cyan -top-1/4 -left-1/4 opacity-60" />
      <div className="glow-purple -bottom-1/4 -right-1/4 opacity-60" />

      <div className="w-full max-w-md relative z-10 text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="glass-card rounded-2xl p-8 border-slate-900 shadow-2xl relative overflow-hidden"
        >
          {/* Top red neon wire */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-neon-rose/60 to-transparent" />

          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-neon-rose/10 border border-neon-rose/25 flex items-center justify-center text-neon-rose shadow-lg shadow-neon-rose/5 animate-pulse">
              <FiAlertTriangle className="w-8 h-8" />
            </div>
          </div>

          <span className="text-5xl font-black text-slate-100 font-mono tracking-tighter block mb-2">404</span>
          <h2 className="text-base font-extrabold text-slate-150 uppercase tracking-widest font-mono">Diverged Path Vector</h2>
          <p className="text-3xs text-slate-400 font-semibold uppercase tracking-wider font-mono text-neon-rose mt-1 mb-4">Route index not found</p>

          <p className="text-xs text-slate-400 leading-relaxed font-sans mb-6">
            The neural forecasting engine could not trace a valid projection curve for this directory path. It may have been relocated or compiled out of service.
          </p>

          <div className="flex flex-col sm:flex-row gap-2 justify-center font-mono text-3xs uppercase font-bold tracking-wider">
            <Link to="/" className="glow-btn-secondary px-5 py-2.5 flex items-center justify-center gap-1.5">
              <FiArrowLeft className="w-3.5 h-3.5" />
              <span>Landing Home</span>
            </Link>
            <Link to="/dashboard" className="glow-btn-primary px-5 py-2.5 flex items-center justify-center gap-1.5">
              <FiGrid className="w-3.5 h-3.5" />
              <span>Terminal Dashboard</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
