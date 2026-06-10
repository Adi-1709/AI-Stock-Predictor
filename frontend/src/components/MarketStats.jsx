import React from 'react';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

export default function MarketStats() {
  const indices = [
    {
      name: 'NIFTY 50',
      value: '23,322.95',
      change: '+114.70',
      pct: '+0.49%',
      positive: true,
      country: 'India',
      flag: '🇮🇳',
      points: [23200, 23220, 23180, 23260, 23290, 23322.95]
    },
    {
      name: 'SENSEX',
      value: '76,606.57',
      change: '+385.60',
      pct: '+0.51%',
      positive: true,
      country: 'India',
      flag: '🇮🇳',
      points: [76200, 76350, 76150, 76400, 76500, 76606.57]
    },
    {
      name: 'NASDAQ',
      value: '17,343.55',
      change: '+140.20',
      pct: '+0.81%',
      positive: true,
      country: 'USA',
      flag: '🇺🇸',
      points: [17150, 17220, 17180, 17280, 17300, 17343.55]
    },
    {
      name: 'S&P 500',
      value: '5,360.79',
      change: '+24.10',
      pct: '+0.45%',
      positive: true,
      country: 'USA',
      flag: '🇺🇸',
      points: [5320, 5340, 5325, 5345, 5350, 5360.79]
    },
    {
      name: 'DOW JONES',
      value: '38,868.04',
      change: '-120.60',
      pct: '-0.31%',
      positive: false,
      country: 'USA',
      flag: '🇺🇸',
      points: [39050, 39000, 39040, 38920, 38890, 38868.04]
    }
  ];

  const mapPointsToPath = (points, width = 70, height = 24) => {
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    return points.map((p, idx) => {
      const x = (idx / (points.length - 1)) * width;
      const y = height - ((p - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' L ');
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full relative z-10">
      {indices.map((index, i) => {
        const pathData = mapPointsToPath(index.points);
        const areaData = `M 0,24 L ${pathData} L 70,24 Z`;
        const gradId = `spark-grad-${index.name.replace(/\s+/g, '-')}`;

        return (
          <div 
            key={i} 
            className="glass-card hover:border-slate-800/80 rounded-xl p-4 flex flex-col justify-between shadow-lg transition-all duration-300 relative group overflow-hidden"
          >
            {/* Subtle neon glowing light bar on hover */}
            <div className={`absolute top-0 left-0 right-0 h-[1.5px] transition-opacity duration-300 opacity-0 group-hover:opacity-100 ${
              index.positive ? 'bg-neon-emerald' : 'bg-neon-rose'
            }`} />

            <div className="flex items-center justify-between text-[8px] font-bold font-mono uppercase tracking-widest text-slate-500">
              <span className="flex items-center gap-1">
                <span>{index.flag}</span>
                <span>{index.name}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className={`w-1 h-1 rounded-full ${index.positive ? 'bg-neon-emerald' : 'bg-neon-rose'} animate-pulse`} />
                <span>LIVE</span>
              </span>
            </div>

            <div className="flex items-end justify-between mt-3.5 gap-2">
              <div className="flex flex-col">
                <span className="text-sm sm:text-base font-extrabold text-slate-100 font-mono tracking-tight leading-none">
                  {index.value}
                </span>
                <div className={`flex items-center gap-0.5 text-[9px] font-extrabold font-mono mt-1.5 leading-none ${
                  index.positive ? 'text-neon-emerald' : 'text-neon-rose'
                }`}>
                  {index.positive ? <FiTrendingUp className="w-3 h-3 shrink-0" /> : <FiTrendingDown className="w-3 h-3 shrink-0" />}
                  <span>{index.change}</span>
                  <span className="opacity-80">({index.pct})</span>
                </div>
              </div>

              {/* Sparkline chart */}
              <div className="w-[70px] h-6 self-end shrink-0">
                <svg viewBox="0 0 70 24" className="w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={index.positive ? '#00ff66' : '#ff2d55'} stopOpacity="0.25" />
                      <stop offset="100%" stopColor={index.positive ? '#00ff66' : '#ff2d55'} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={areaData} fill={`url(#${gradId})`} />
                  <path 
                    d={`M ${pathData}`} 
                    fill="none" 
                    stroke={index.positive ? '#00ff66' : '#ff2d55'} 
                    strokeWidth="1.6" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                </svg>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
