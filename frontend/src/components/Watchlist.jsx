import React, { useState } from 'react';
import { useStock } from '../context/StockContext';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { FiPlus, FiTrash2, FiBookmark, FiSearch, FiStar, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { motion, Reorder } from 'framer-motion';
import { ResponsiveContainer, LineChart, Line } from 'recharts';

export default function Watchlist() {
  const { watchlist, getStockBySymbol, selectedStockSymbol, setSelectedStockSymbol, removeFromWatchlist, allStocks, addToWatchlist } = useStock();
  const [items, setItems] = useState(watchlist);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState('none'); // 'none', 'symbol', 'price', 'change', 'prediction'
  const [sortDir, setSortDir] = useState('asc'); // 'asc', 'desc'

  // Sync state if context changes
  React.useEffect(() => {
    setItems(watchlist);
  }, [watchlist]);

  const watchlistStocks = items.map(symbol => getStockBySymbol(symbol)).filter(Boolean);

  const sortedWatchlistStocks = React.useMemo(() => {
    let list = [...watchlistStocks];
    if (sortKey === 'symbol') {
      list.sort((a, b) => sortDir === 'asc' ? a.symbol.localeCompare(b.symbol) : b.symbol.localeCompare(a.symbol));
    } else if (sortKey === 'price') {
      list.sort((a, b) => sortDir === 'asc' ? a.price - b.price : b.price - a.price);
    } else if (sortKey === 'change') {
      list.sort((a, b) => sortDir === 'asc' ? a.changePercent - b.changePercent : b.changePercent - a.changePercent);
    } else if (sortKey === 'prediction') {
      list.sort((a, b) => {
        const valA = a.aiPrediction?.prediction || '';
        const valB = b.aiPrediction?.prediction || '';
        return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
    }
    return list;
  }, [watchlistStocks, sortKey, sortDir]);
  
  const availableToAdd = allStocks.filter(stock => 
    !items.includes(stock.symbol) && 
    (stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
     stock.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSortToggle = (key) => {
    if (sortKey === key) {
      if (sortDir === 'asc') {
        setSortDir('desc');
      } else {
        setSortKey('none');
      }
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 flex flex-col h-full relative overflow-hidden" 
         style={{ border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 8px 32px -8px rgba(0,0,0,0.5)' }}>
      
      {/* Top subtle wire */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-900/60 pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
            <FiBookmark className="text-neon-cyan w-3.5 h-3.5" />
          </div>
          <div className="font-mono">
            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Live Tracker</p>
            <h4 className="text-[10px] font-black text-slate-100 tracking-wider uppercase mt-0.5">Watchlist</h4>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[7px] font-black uppercase tracking-widest text-slate-500 font-mono px-2 py-1 rounded bg-slate-900 border border-slate-800">
            Most Watched
          </span>
          <span className="text-[9px] bg-slate-950 px-2.5 py-1 rounded-lg text-slate-400 border border-slate-800 font-mono font-black tracking-widest">
            {watchlistStocks.length} ASSETS
          </span>
        </div>
      </div>

      {/* Sort Badges Bar */}
      <div className="flex items-center gap-1.5 flex-wrap font-mono text-[8px] text-slate-500 font-black tracking-widest uppercase mb-3 border-b border-slate-900/40 pb-2.5">
        <span>Sort By:</span>
        <button 
          onClick={() => setSortKey('none')}
          className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${sortKey === 'none' ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'}`}
        >
          DRAG (NONE)
        </button>
        <button 
          onClick={() => handleSortToggle('symbol')}
          className={`px-2 py-0.5 rounded transition-colors flex items-center gap-0.5 cursor-pointer ${sortKey === 'symbol' ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'}`}
        >
          SYMBOL {sortKey === 'symbol' && (sortDir === 'asc' ? '▲' : '▼')}
        </button>
        <button 
          onClick={() => handleSortToggle('price')}
          className={`px-2 py-0.5 rounded transition-colors flex items-center gap-0.5 cursor-pointer ${sortKey === 'price' ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'}`}
        >
          PRICE {sortKey === 'price' && (sortDir === 'asc' ? '▲' : '▼')}
        </button>
        <button 
          onClick={() => handleSortToggle('change')}
          className={`px-2 py-0.5 rounded transition-colors flex items-center gap-0.5 cursor-pointer ${sortKey === 'change' ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'}`}
        >
          RETURN {sortKey === 'change' && (sortDir === 'asc' ? '▲' : '▼')}
        </button>
        <button 
          onClick={() => handleSortToggle('prediction')}
          className={`px-2 py-0.5 rounded transition-colors flex items-center gap-0.5 cursor-pointer ${sortKey === 'prediction' ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'}`}
        >
          PREDICT {sortKey === 'prediction' && (sortDir === 'asc' ? '▲' : '▼')}
        </button>
      </div>

      {/* Rows Container */}
      <div className="flex-1 space-y-2 overflow-y-auto max-h-80 pr-1 custom-scrollbar">
        {sortKey === 'none' ? (
          <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-2 font-mono">
            {sortedWatchlistStocks.map((stock) => {
              const isSelected = selectedStockSymbol === stock.symbol;
              const isUp = stock.change >= 0;
              const predDir = stock.aiPrediction?.direction || 'neutral';
              const predColor = predDir === 'bullish' ? '#00ff66' : predDir === 'bearish' ? '#ff2d55' : '#f59e0b';
              const predBg = predColor + '12';
              const predBorder = predColor + '30';
              const sparkData = stock.chartData?.['1D']?.slice(-5) || [];

              return (
                <Reorder.Item
                  key={stock.symbol}
                  value={stock.symbol}
                  whileDrag={{ scale: 1.02, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}
                  onClick={() => setSelectedStockSymbol(stock.symbol)}
                  className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between cursor-grab active:cursor-grabbing group transition-colors duration-300 relative overflow-hidden ${
                    isSelected
                      ? 'bg-slate-900/80 border-neon-cyan/40 shadow-[0_0_15px_rgba(0,240,255,0.08)]'
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/80 hover:border-slate-700'
                  }`}
                >
                  {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-neon-cyan" style={{ boxShadow: '0 0 10px #00f0ff' }} />}
                  <div className="flex items-center gap-3 sm:w-1/3 min-w-[110px]">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black tracking-wider text-[11px] text-slate-100 group-hover:text-white transition-colors">
                          {stock.symbol}
                        </span>
                        <span className="text-[7.5px] text-slate-650 font-black font-mono">
                          {stock.exchange} {stock.countryFlag}
                        </span>
                        <FiStar className={`w-2.5 h-2.5 ${isSelected ? 'text-neon-cyan' : 'text-slate-600 hover:text-amber-400'}`} />
                      </div>
                      <span className="text-[8px] text-slate-500 font-sans truncate max-w-[100px] font-semibold mt-0.5">
                        {stock.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-center sm:w-1/3 gap-4 my-2 sm:my-0">
                    <div className="flex flex-col items-center">
                      <span className="px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest border"
                            style={{ color: predColor, background: predBg, borderColor: predBorder }}>
                        {stock.aiPrediction?.prediction || predDir}
                      </span>
                      <span className="text-[7px] font-black text-slate-500 mt-0.5">{stock.aiPrediction?.confidence || 50}% CONF</span>
                    </div>
                    <div className="w-16 h-8 opacity-70 group-hover:opacity-100 transition-opacity">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sparkData}>
                          <Line type="monotone" dataKey="close" stroke={isUp ? '#00ff66' : '#ff2d55'} strokeWidth={1.5} dot={false} isAnimationActive={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end sm:w-1/3 gap-3">
                    <div className="text-right flex flex-col">
                      <span className="text-[11px] font-black text-slate-250">
                        {formatCurrency(stock.price, stock.currency)}
                      </span>
                      <span className={`text-[9px] font-black tracking-tighter mt-0.5 flex items-center justify-end gap-0.5 ${isUp ? 'text-neon-emerald' : 'text-neon-rose'}`}>
                        {isUp ? <FiTrendingUp className="w-2.5 h-2.5" /> : <FiTrendingDown className="w-2.5 h-2.5" />}
                        {formatPercent(stock.changePercent)}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWatchlist(stock.symbol);
                      }}
                      className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-500 hover:text-neon-rose hover:border-neon-rose/40 hover:bg-neon-rose/10 opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
                      title="Remove Asset"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        ) : (
          <div className="space-y-2 font-mono">
            {sortedWatchlistStocks.map((stock) => {
              const isSelected = selectedStockSymbol === stock.symbol;
              const isUp = stock.change >= 0;
              const predDir = stock.aiPrediction?.direction || 'neutral';
              const predColor = predDir === 'bullish' ? '#00ff66' : predDir === 'bearish' ? '#ff2d55' : '#f59e0b';
              const predBg = predColor + '12';
              const predBorder = predColor + '30';
              const sparkData = stock.chartData?.['1D']?.slice(-5) || [];

              return (
                <div
                  key={stock.symbol}
                  onClick={() => setSelectedStockSymbol(stock.symbol)}
                  className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer group transition-colors duration-300 relative overflow-hidden ${
                    isSelected
                      ? 'bg-slate-900 border-neon-cyan/40 shadow-[0_0_15px_rgba(0,240,255,0.08)]'
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/80 hover:border-slate-700'
                  }`}
                >
                  {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-neon-cyan" style={{ boxShadow: '0 0 10px #00f0ff' }} />}
                  <div className="flex items-center gap-3 sm:w-1/3 min-w-[110px]">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black tracking-wider text-[11px] text-slate-100 group-hover:text-white transition-colors">
                          {stock.symbol}
                        </span>
                        <span className="text-[7.5px] text-slate-650 font-black font-mono">
                          {stock.exchange} {stock.countryFlag}
                        </span>
                        <FiStar className={`w-2.5 h-2.5 ${isSelected ? 'text-neon-cyan' : 'text-slate-600 hover:text-amber-400'}`} />
                      </div>
                      <span className="text-[8px] text-slate-500 font-sans truncate max-w-[100px] font-semibold mt-0.5">
                        {stock.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-center sm:w-1/3 gap-4 my-2 sm:my-0">
                    <div className="flex flex-col items-center">
                      <span className="px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest border"
                            style={{ color: predColor, background: predBg, borderColor: predBorder }}>
                        {stock.aiPrediction?.prediction || predDir}
                      </span>
                      <span className="text-[7px] font-black text-slate-500 mt-0.5">{stock.aiPrediction?.confidence || 50}% CONF</span>
                    </div>
                    <div className="w-16 h-8 opacity-70 group-hover:opacity-100 transition-opacity">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sparkData}>
                          <Line type="monotone" dataKey="close" stroke={isUp ? '#00ff66' : '#ff2d55'} strokeWidth={1.5} dot={false} isAnimationActive={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end sm:w-1/3 gap-3">
                    <div className="text-right flex flex-col">
                      <span className="text-[11px] font-black text-slate-200">
                        {formatCurrency(stock.price, stock.currency)}
                      </span>
                      <span className={`text-[9px] font-black tracking-tighter mt-0.5 flex items-center justify-end gap-0.5 ${isUp ? 'text-neon-emerald' : 'text-neon-rose'}`}>
                        {isUp ? <FiTrendingUp className="w-2.5 h-2.5" /> : <FiTrendingDown className="w-2.5 h-2.5" />}
                        {formatPercent(stock.changePercent)}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWatchlist(stock.symbol);
                      }}
                      className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-500 hover:text-neon-rose hover:border-neon-rose/40 hover:bg-neon-rose/10 opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
                      title="Remove Asset"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {watchlistStocks.length === 0 && (
          <div className="text-center py-8 text-[9px] text-slate-500 font-mono uppercase font-black tracking-widest border border-dashed border-slate-800 rounded-xl bg-slate-950/30">
            Watchlist Empty.<br/><span className="text-slate-600 mt-1 block">Search to track assets.</span>
          </div>
        )}
      </div>

      {/* Add New Panel */}
      <div className="mt-4 pt-4 border-t border-slate-900/60 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="block text-[8px] font-black uppercase tracking-widest text-slate-500 font-mono">
            Track New Asset
          </span>
          {/* Search Input */}
          <div className="relative w-32">
            <FiSearch className="absolute left-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded pl-6 pr-2 py-1 text-[8px] font-mono text-slate-300 focus:outline-none focus:border-neon-cyan/50 placeholder:text-slate-700 transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto custom-scrollbar pr-1">
          {availableToAdd.map((stock) => (
            <motion.button
              key={stock.symbol}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => addToWatchlist(stock.symbol)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-neon-cyan/40 text-slate-400 hover:text-neon-cyan hover:bg-neon-cyan/5 text-[8px] font-black transition-colors duration-200 font-mono uppercase tracking-widest cursor-pointer shadow-sm"
            >
              <FiPlus className="w-2.5 h-2.5" />
              <span>{stock.symbol}</span>
            </motion.button>
          ))}
          {availableToAdd.length === 0 && searchQuery && (
            <span className="text-[8px] text-slate-650 font-mono italic">No matching assets found.</span>
          )}
        </div>
      </div>
    </div>
  );
}
