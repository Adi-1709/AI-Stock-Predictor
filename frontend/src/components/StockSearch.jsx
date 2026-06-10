import React, { useState, useRef, useEffect } from 'react';
import { FiSearch, FiX, FiCheck, FiTrendingUp, FiTrendingDown, FiClock } from 'react-icons/fi';
import { useStock } from '../context/StockContext';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '../utils/formatters';

// Symbol chip color map for visual differentiation
const SYMBOL_COLORS = {
  AAPL:          { bg: 'bg-sky-500/15',     text: 'text-sky-400',     border: 'border-sky-500/25'     },
  TSLA:          { bg: 'bg-rose-500/15',    text: 'text-rose-400',    border: 'border-rose-500/25'    },
  MSFT:          { bg: 'bg-blue-500/15',    text: 'text-blue-400',    border: 'border-blue-500/25'    },
  NVDA:          { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/25' },
  'TCS.NS':      { bg: 'bg-indigo-500/15',  text: 'text-indigo-400',  border: 'border-indigo-500/25'  },
  'RELIANCE.NS': { bg: 'bg-orange-500/15',  text: 'text-orange-400',  border: 'border-orange-500/25'  },
  'INFY.NS':     { bg: 'bg-teal-500/15',    text: 'text-teal-400',    border: 'border-teal-500/25'    },
  'HDFCBANK.NS': { bg: 'bg-violet-500/15',  text: 'text-violet-400',  border: 'border-violet-500/25'  },
};

const DEFAULT_CHIP = { bg: 'bg-slate-800', text: 'text-slate-400', border: 'border-slate-700' };

function SymbolChip({ symbol }) {
  const c = SYMBOL_COLORS[symbol] || DEFAULT_CHIP;
  return (
    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-[8px] font-black border shrink-0 font-mono tracking-wider ${c.bg} ${c.text} ${c.border}`}>
      {symbol.slice(0, 2)}
    </span>
  );
}

export default function StockSearch() {
  const { allStocks, selectedStockSymbol, setSelectedStockSymbol, searchStocks } = useStock();
  const [query, setQuery]           = useState('');
  const [isOpen, setIsOpen]         = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [isFocused, setIsFocused]   = useState(false);
  const dropdownRef = useRef(null);
  const inputRef    = useRef(null);

  const results    = searchStocks(query);
  const activeList = query ? results : allStocks.slice(0, 6);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setFocusedIndex(-1);
  }, [query, isOpen]);

  const handleSelect = (symbol) => {
    setSelectedStockSymbol(symbol);
    setQuery('');
    setIsOpen(false);
    setIsFocused(false);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') setIsOpen(true);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev === activeList.length - 1 ? 0 : prev + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev <= 0 ? activeList.length - 1 : prev - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < activeList.length) {
        handleSelect(activeList[focusedIndex].symbol);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full z-50 font-mono" ref={dropdownRef}>

      {/* ── Search Input ── */}
      <div className="relative group">
        {/* Animated glow ring on focus */}
        <div className={`absolute inset-0 rounded-xl transition-all duration-400 pointer-events-none ${
          isFocused
            ? 'shadow-[0_0_0_1px_rgba(0,240,255,0.35),0_0_20px_rgba(0,240,255,0.10)]'
            : 'shadow-none'
        }`} />

        {/* Search icon */}
        <FiSearch className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${
          isFocused ? 'text-neon-cyan' : 'text-slate-500'
        }`} />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => { setIsOpen(true); setIsFocused(true); }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Search tickers — AAPL, NVDA, TSLA..."
          className="w-full pl-11 pr-12 py-3 bg-slate-950/60 border border-slate-800/80 focus:border-neon-cyan/40 rounded-xl text-xs text-slate-100 placeholder-slate-600 focus:outline-none transition-all duration-300 font-mono tracking-wide"
        />

        {/* Active stock chip or clear button */}
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {query ? (
            <button
              onClick={() => { setQuery(''); setIsOpen(false); inputRef.current?.focus(); }}
              className="p-1 rounded-md text-slate-500 hover:text-white hover:bg-slate-800 transition-all duration-200 cursor-pointer"
            >
              <FiX className="w-3.5 h-3.5" />
            </button>
          ) : (
            selectedStockSymbol && (
              <span className={`text-[8px] font-black px-2 py-0.5 rounded border font-mono tracking-widest ${
                (SYMBOL_COLORS[selectedStockSymbol] || DEFAULT_CHIP).bg
              } ${(SYMBOL_COLORS[selectedStockSymbol] || DEFAULT_CHIP).text} ${
                (SYMBOL_COLORS[selectedStockSymbol] || DEFAULT_CHIP).border
              }`}>
                {selectedStockSymbol}
              </span>
            )
          )}
        </div>
      </div>

      {/* ── Dropdown Panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.99 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full left-0 right-0 mt-2 z-50 glass-card rounded-xl shadow-2xl overflow-hidden"
            style={{ border: '1px solid rgba(32,43,61,0.9)' }}
          >
            {/* Subtle top accent line */}
            <div className="h-[1px] bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent" />

            {query ? (
              results.length > 0 ? (
                <div className="py-1.5">
                  <div className="px-4 pt-1 pb-2 text-[8px] font-black uppercase tracking-widest text-slate-600 flex items-center gap-1.5">
                    <FiSearch className="w-2.5 h-2.5" />
                    Search Results
                  </div>
                  {results.map((stock, index) => (
                    <StockRow
                      key={stock.symbol}
                      stock={stock}
                      isFocused={focusedIndex === index}
                      isSelected={selectedStockSymbol === stock.symbol}
                      onSelect={handleSelect}
                    />
                  ))}
                </div>
              ) : (
                <div className="px-4 py-6 text-center">
                  <p className="text-[9px] text-slate-550 font-black uppercase tracking-widest">No instruments found</p>
                  <p className="text-[8px] text-slate-700 mt-1 font-mono">Try AAPL, MSFT, NVDA, TSLA</p>
                </div>
              )
            ) : (
              <div className="py-1.5 divide-y divide-slate-900/40">
                {/* Quick Shortcuts */}
                <div className="px-4 py-2 pb-3">
                  <span className="text-[7.5px] font-black uppercase tracking-widest text-slate-500 block mb-2 font-mono">Quick Shortcuts</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: 'Reliance', sym: 'RELIANCE.NS' },
                      { label: 'TCS', sym: 'TCS.NS' },
                      { label: 'Infosys', sym: 'INFY.NS' },
                      { label: 'Apple', sym: 'AAPL' },
                      { label: 'Tesla', sym: 'TSLA' }
                    ].map(s => (
                      <button
                        key={s.sym}
                        onMouseDown={(e) => {
                          e.preventDefault(); // prevent blur before click
                          handleSelect(s.sym);
                        }}
                        className="px-2.5 py-1 bg-slate-900/80 border border-slate-800/80 hover:border-neon-cyan/45 text-[8.5px] text-slate-350 hover:text-white rounded-lg transition-all font-mono cursor-pointer"
                      >
                        {s.label} ({s.sym.replace('.NS', '')})
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <div className="px-4 pb-2 text-[8px] font-black uppercase tracking-widest text-slate-600 flex items-center gap-1.5">
                    <FiTrendingUp className="w-2.5 h-2.5 text-neon-emerald" />
                    Trending Instruments
                  </div>
                  {allStocks.slice(0, 6).map((stock, index) => (
                    <StockRow
                      key={stock.symbol}
                      stock={stock}
                      isFocused={focusedIndex === index}
                      isSelected={selectedStockSymbol === stock.symbol}
                      onSelect={handleSelect}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Bottom hint */}
            <div className="px-4 py-2 border-t border-slate-900/60 text-[8px] text-slate-700 font-mono flex items-center justify-between">
              <span>↑↓ Navigate · Enter Select · Esc Close</span>
              <span className="text-slate-800">AlphaStock AI</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Individual stock row in dropdown
function StockRow({ stock, isFocused, isSelected, onSelect }) {
  const isUp = stock.change >= 0;

  return (
    <button
      onClick={() => onSelect(stock.symbol)}
      className={`w-full px-3.5 py-2.5 text-left flex items-center gap-3 transition-all duration-150 cursor-pointer ${
        isFocused
          ? 'bg-slate-800/70 text-slate-100'
          : 'hover:bg-slate-900/60 text-slate-300'
      }`}
    >
      {/* Symbol chip */}
      <SymbolChip symbol={stock.symbol} />

      {/* Name + Symbol */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black tracking-wider text-slate-100">{stock.symbol}</span>
          <span className="text-[7px] text-slate-550 font-black uppercase tracking-widest font-mono">
            {stock.exchange} {stock.countryFlag}
          </span>
          {isSelected && (
            <span className="inline-flex items-center gap-0.5 text-[7px] font-black text-neon-cyan uppercase tracking-widest border border-neon-cyan/30 px-1.5 py-0.5 rounded">
              <FiCheck className="w-2 h-2" /> Active
            </span>
          )}
        </div>
        <span className="text-[8px] text-slate-600 font-sans truncate block mt-0.5">{stock.name}</span>
      </div>

      {/* Price + change */}
      <div className="text-right shrink-0">
        <div className="text-[10px] font-black text-slate-200 font-mono">
          {formatCurrency(stock.price, stock.currency)}
        </div>
        <div className={`flex items-center justify-end gap-0.5 text-[8px] font-bold mt-0.5 ${isUp ? 'text-neon-emerald' : 'text-neon-rose'}`}>
          {isUp ? <FiTrendingUp className="w-2.5 h-2.5" /> : <FiTrendingDown className="w-2.5 h-2.5" />}
          {isUp ? '+' : ''}{stock.changePercent?.toFixed(2)}%
        </div>
      </div>
    </button>
  );
}
