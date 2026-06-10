import React from 'react';

export default function LoadingSpinner({ size = 'md', fullScreen = false }) {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-12 h-12 border-4',
    lg: 'w-16 h-16 border-4',
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center'
    : 'flex flex-col items-center justify-center py-12 w-full';

  return (
    <div className={containerClasses}>
      <div className="relative">
        {/* Glow behind spinner */}
        <div className={`absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse`} />
        
        {/* Spinner rings */}
        <div
          className={`${sizeClasses[size]} border-slate-800 border-t-emerald-500 rounded-full animate-spin relative z-10`}
        />
      </div>
      <p className="mt-4 text-xs font-semibold tracking-widest text-slate-500 uppercase animate-pulse">
        Analyzing Market Signals...
      </p>
    </div>
  );
}
