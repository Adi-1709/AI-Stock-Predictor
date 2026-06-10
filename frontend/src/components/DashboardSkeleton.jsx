import React from 'react';

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse relative z-10 text-slate-100 font-sans">
      
      {/* Dashboard Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900/60 pb-5">
        <div className="space-y-2">
          <div className="h-6 w-64 bg-slate-900 rounded-lg shimmer" />
          <div className="h-3.5 w-96 bg-slate-900 rounded-lg shimmer" />
        </div>
        
        {/* Search & Selector Skeleton */}
        <div className="h-10 w-full md:w-80 bg-slate-900 rounded-xl shimmer" />
      </div>

      {/* Top Statistics Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div 
            key={i} 
            className="glass-card rounded-xl p-4 flex flex-col justify-between h-28"
          >
            <div className="space-y-2">
              <div className="h-2.5 w-16 bg-slate-900 rounded shimmer" />
              <div className="h-5.5 w-24 bg-slate-900 rounded shimmer" />
            </div>
            
            <div className="flex items-center justify-between mt-3">
              <div className="h-2.5 w-14 bg-slate-900 rounded shimmer" />
              <div className="w-14 h-4 bg-slate-900/60 rounded shimmer" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns (Charts, Technicals, Sentiment, History) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Stock Chart Skeleton */}
          <div className="glass-card rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900/60 pb-4">
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <div className="h-5.5 w-14 bg-slate-900 rounded shimmer" />
                  <div className="h-3.5 w-28 bg-slate-900 rounded shimmer" />
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="h-4.5 w-20 bg-slate-900 rounded shimmer" />
                  <div className="h-3 w-10 bg-slate-900 rounded shimmer" />
                </div>
              </div>

              {/* Time Horizon tabs */}
              <div className="h-8 w-44 bg-slate-900 rounded-lg shimmer" />
            </div>

            {/* Chart Area */}
            <div className="h-72 sm:h-80 w-full bg-slate-900/30 rounded-xl shimmer" />
          </div>

          {/* Technical Analysis Skeleton */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="h-4.5 w-44 bg-slate-900 rounded shimmer mb-2" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-slate-950/40 rounded-xl p-3 border border-slate-900/60 space-y-3">
                  <div className="flex justify-between">
                    <div className="h-2.5 w-10 bg-slate-900 rounded shimmer" />
                    <div className="h-2.5 w-14 bg-slate-900 rounded shimmer" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-slate-900 rounded-full shimmer" />
                    <div className="h-2.5 w-5 bg-slate-900 rounded shimmer" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sentiment Analysis Skeleton */}
          <div className="glass-card rounded-2xl p-5 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Pie Chart space */}
            <div className="md:col-span-5 flex justify-center">
              <div className="w-32 h-32 rounded-full border-[6px] border-slate-900 flex items-center justify-center shimmer">
                <div className="w-16 h-16 rounded-full bg-slate-950/20" />
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="md:col-span-7 space-y-4">
              <div className="h-4 w-44 bg-slate-900 rounded shimmer" />
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-2.5 w-24 bg-slate-900 rounded shimmer" />
                    <div className="h-2.5 w-6 bg-slate-900 rounded shimmer" />
                  </div>
                ))}
              </div>
              <div className="h-10 w-full bg-slate-900/20 rounded shimmer pt-2" />
            </div>
          </div>

          {/* Prediction History Table Skeleton */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex justify-between border-b border-slate-900/60 pb-3">
              <div className="h-4.5 w-36 bg-slate-900 rounded shimmer" />
              <div className="h-8 w-36 bg-slate-900 rounded-lg shimmer" />
            </div>

            <div className="space-y-3.5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-slate-900/40">
                  <div className="h-3 w-10 bg-slate-900 rounded shimmer" />
                  <div className="h-4.5 w-16 bg-slate-900 rounded shimmer" />
                  <div className="h-3 w-8 bg-slate-900 rounded shimmer" />
                  <div className="h-3 w-8 bg-slate-900 rounded shimmer" />
                  <div className="h-3 w-16 bg-slate-900 rounded shimmer" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (AI Predictor, Watchlists, Insights) */}
        <div className="space-y-6">
          
          {/* AI Prediction Card Skeleton */}
          <div className="glass-card rounded-2xl p-5 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-900/60 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-900 shimmer" />
                <div className="space-y-1.5">
                  <div className="h-4 w-24 bg-slate-900 rounded shimmer" />
                  <div className="h-2.5 w-12 bg-slate-900 rounded shimmer" />
                </div>
              </div>
              <div className="h-5.5 w-14 bg-slate-900 rounded shimmer" />
            </div>

            {/* Radial Dial Space */}
            <div className="flex items-center justify-around my-4">
              <div className="w-20 h-20 rounded-full border-4 border-slate-900 shimmer" />
              <div className="space-y-2">
                <div className="h-3 w-20 bg-slate-900 rounded shimmer" />
                <div className="h-3 w-16 bg-slate-900 rounded shimmer" />
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="h-8.5 bg-slate-900 rounded shimmer" />
              <div className="h-8.5 bg-slate-900 rounded shimmer" />
            </div>
          </div>

          {/* AI Insights Panel Skeleton */}
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <div className="h-3 w-28 bg-slate-900 rounded shimmer" />
            <div className="h-10 w-full bg-slate-900/40 rounded shimmer" />
          </div>

          {/* Watchlist Section Skeleton */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="h-4.5 w-24 bg-slate-900 rounded shimmer" />
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-900/40">
                  <div className="flex items-center gap-2">
                    <div className="h-4.5 w-8 bg-slate-900 rounded shimmer" />
                    <div className="h-3 w-14 bg-slate-900 rounded shimmer" />
                  </div>
                  <div className="h-4.5 w-12 bg-slate-900 rounded shimmer" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
