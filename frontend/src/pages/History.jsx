import React, { useState, useEffect } from 'react';
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiFilter, 
  FiCheckCircle, 
  FiXCircle, 
  FiSearch, 
  FiActivity, 
  FiAward, 
  FiLayers, 
  FiTrendingUp as FiBuy, 
  FiTrendingDown as FiSell, 
  FiChevronLeft, 
  FiChevronRight,
  FiClock
} from 'react-icons/fi';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

export default function History() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;

  // Persistent server-side state hooks
  const [historyLogs, setHistoryLogs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: '1,420 Run Cycles',
    accuracy: '75.0%',
    bestStock: 'NVDA (100% Win)',
    successRate: '9 Wins / 3 Losses'
  });

  // Fetch metrics statistics on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/history/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load history metrics:', err);
      }
    };
    fetchStats();
  }, []);

  // Fetch paginated log runs whenever constraints alter
  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/history', {
          params: {
            searchTerm,
            filterType,
            sortKey,
            sortDir,
            page: currentPage,
            limit: rowsPerPage
          }
        });
        setHistoryLogs(res.data.logs);
        setTotalCount(res.data.total);
      } catch (err) {
        console.error('Failed to query historical log segments:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, [searchTerm, filterType, sortKey, sortDir, currentPage]);

  const totalPages = Math.ceil(totalCount / rowsPerPage) || 1;

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
    setCurrentPage(1);
  };

  const getPredictionStyles = (pred) => {
    switch (pred) {
      case 'BUY':
        return { text: 'text-neon-emerald', border: 'border-neon-emerald/20 bg-neon-emerald/5', dot: 'bg-neon-emerald' };
      case 'SELL':
        return { text: 'text-neon-rose', border: 'border-neon-rose/20 bg-neon-rose/5', dot: 'bg-neon-rose' };
      default:
        return { text: 'text-amber-450', border: 'border-amber-500/20 bg-amber-500/5', dot: 'bg-amber-500' };
    }
  };


  return (
    <div className="space-y-6 relative z-10 text-slate-100 font-sans">
      
      {/* Page Title */}
      <div className="border-b border-slate-900/60 pb-5">
        <h2 className="text-lg sm:text-xl font-black text-slate-100 uppercase tracking-widest font-mono">
          Prediction History & Analytics
        </h2>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono mt-1">
          Historical backtests logs and neural forecast complied indices
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="glass-card rounded-xl p-4 shadow-lg relative group overflow-hidden transition-all duration-300 hover:-translate-y-0.5">
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-neon-cyan to-transparent opacity-80" />
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest font-mono block">Total Predictions</span>
            <FiLayers className="text-neon-cyan w-4 h-4" />
          </div>
          <span className="text-base sm:text-lg font-black text-slate-100 font-mono tracking-wider block mt-2.5">
            {stats.total}
          </span>
        </div>

        {/* Card 2 */}
        <div className="glass-card rounded-xl p-4 shadow-lg relative group overflow-hidden transition-all duration-300 hover:-translate-y-0.5">
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-neon-emerald to-transparent opacity-80" />
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest font-mono block">Accuracy Rate</span>
            <FiAward className="text-neon-emerald w-4 h-4" />
          </div>
          <span className="text-base sm:text-lg font-black text-neon-emerald font-mono tracking-wider block mt-2.5">
            {stats.accuracy}
          </span>
        </div>

        {/* Card 3 */}
        <div className="glass-card rounded-xl p-4 shadow-lg relative group overflow-hidden transition-all duration-300 hover:-translate-y-0.5">
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-neon-purple to-transparent opacity-80" />
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest font-mono block">Best Performing Asset</span>
            <FiActivity className="text-neon-purple w-4 h-4" />
          </div>
          <span className="text-base sm:text-lg font-black text-slate-200 font-mono tracking-wider block mt-2.5">
            {stats.bestStock}
          </span>
        </div>

        {/* Card 4 */}
        <div className="glass-card rounded-xl p-4 shadow-lg relative group overflow-hidden transition-all duration-300 hover:-translate-y-0.5">
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-neon-rose to-transparent opacity-80" />
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest font-mono block">Prediction Outcome</span>
            <FiCheckCircle className="text-neon-rose w-4 h-4" />
          </div>
          <span className="text-base sm:text-lg font-black text-slate-200 font-mono tracking-wider block mt-2.5">
            {stats.successRate}
          </span>
        </div>
      </div>

      {/* Filter and control bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-card p-4 rounded-xl">
        <div className="relative w-full sm:max-w-xs font-mono text-[10px] w-full">
          <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search Stock symbol (e.g. AAPL)..."
            className="w-full pl-8 pr-3 py-2 bg-slate-950/45 border border-slate-900 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/10 transition-all duration-300"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end font-mono">
          <FiFilter className="text-slate-550 w-4 h-4 hidden sm:block" />
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-slate-950/45 border border-slate-900 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-450 focus:outline-none focus:border-neon-cyan/40 cursor-pointer transition-colors"
          >
            <option value="all">Prediction: All</option>
            <option value="buy">Prediction: Buy</option>
            <option value="sell">Prediction: Sell</option>
            <option value="hold">Prediction: Hold</option>
          </select>
        </div>
      </div>

      {/* Logs table */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-xl relative">
        {/* Top styling neon wire */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-slate-800 to-transparent" />

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-[10px]">
            <thead>
              <tr className="border-b border-slate-900 bg-slate-950/65 text-slate-500 font-black uppercase tracking-widest">
                <th className="p-4 pl-6">Stock Symbol</th>
                <th className="p-4">Prediction Vector</th>
                <th className="p-4 cursor-pointer hover:text-white transition-colors select-none" onClick={() => handleSort('confidence')}>
                  Confidence % {sortKey === 'confidence' ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
                <th className="p-4">Actual Close</th>
                <th className="p-4">Accuracy Status</th>
                <th className="p-4 pr-6 text-right cursor-pointer hover:text-white transition-colors select-none" onClick={() => handleSort('date')}>
                  Date & Time {sortKey === 'date' ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/35 text-slate-350">
              {isLoading ? (
                [...Array(rowsPerPage)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4 pl-6"><div className="h-3.5 w-12 bg-slate-900 rounded shimmer" /></td>
                    <td className="p-4"><div className="h-5.5 w-20 bg-slate-900 rounded-lg shimmer" /></td>
                    <td className="p-4"><div className="h-3.5 w-10 bg-slate-900 rounded shimmer" /></td>
                    <td className="p-4"><div className="h-3.5 w-14 bg-slate-900 rounded shimmer" /></td>
                    <td className="p-4"><div className="h-5.5 w-24 bg-slate-900 rounded-lg shimmer" /></td>
                    <td className="p-4 pr-6"><div className="h-3.5 w-24 bg-slate-900 rounded shimmer ml-auto" /></td>
                  </tr>
                ))
              ) : historyLogs.map((log, index) => {
                const styles = getPredictionStyles(log.prediction);
                const isComplied = log.status === 'Complied';
                return (
                  <tr key={index} className="hover:bg-slate-900/35 transition-all">
                    <td className="p-4 pl-6 font-extrabold text-slate-100 tracking-wider text-xs sm:text-sm">{log.symbol}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[8px] font-black uppercase border ${styles.border} ${styles.text}`}>
                        <span className={`w-1 h-1 rounded-full ${styles.dot}`} />
                        <span>{log.prediction}</span>
                      </span>
                    </td>
                    <td className="p-4 text-slate-205 font-bold">{log.confidence}%</td>
                    <td className="p-4 text-slate-205 font-semibold">{formatCurrency(log.currentPrice || log.actual)}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[8px] font-extrabold uppercase ${
                        isComplied 
                          ? 'bg-neon-emerald/5 border border-neon-emerald/20 text-neon-emerald'
                          : 'bg-neon-rose/5 border border-neon-rose/20 text-neon-rose'
                      }`}>
                        {isComplied ? <FiCheckCircle className="w-3.5 h-3.5" /> : <FiXCircle className="w-3.5 h-3.5" />}
                        <span className="ml-1">{log.status}</span>
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right text-slate-500 font-semibold flex items-center justify-end gap-1.5">
                      <FiClock className="w-3 h-3 text-slate-600" />
                      <span>{log.date}</span>
                    </td>
                  </tr>
                );
              })}

              {!isLoading && historyLogs.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-16 px-4">
                    <div className="flex flex-col items-center justify-center text-center space-y-4 max-w-sm mx-auto">
                      <div className="relative">
                        {/* Glowing backdrop */}
                        <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/10 via-neon-purple/10 to-transparent blur-xl w-32 h-32 rounded-full -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2" />
                        
                        <svg className="w-20 h-20 text-slate-800 relative z-10" fill="none" viewBox="0 0 100 100" stroke="currentColor">
                          {/* Folder/Database lines */}
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" strokeDasharray="3 3" d="M25 38h50M25 50h50M25 62h50" stroke="rgba(255, 255, 255, 0.08)" />
                          <rect x="20" y="22" width="60" height="56" rx="8" strokeWidth="1.5" stroke="rgba(0, 240, 255, 0.2)" />
                          {/* Magnifying Glass */}
                          <circle cx="58" cy="58" r="10" stroke="url(#cyanPurpleGrad)" strokeWidth="2.2" fill="#0b0f19" fillOpacity="0.85" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M65 65l10 10" stroke="url(#cyanPurpleGrad)" />
                          <defs>
                            <linearGradient id="cyanPurpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#00f0ff" />
                              <stop offset="100%" stopColor="#bc34fa" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                      <div className="space-y-1 z-10 font-mono">
                        <h4 className="text-[10px] font-black tracking-widest uppercase text-slate-350">
                          No Forecast Records Found
                        </h4>
                        <p className="text-[9px] text-slate-500 font-bold font-sans uppercase">
                          We couldn't find any prediction runs matching your query constraints. Try clearing your search input or resetting filter fields.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-widest font-black">
          <span className="text-slate-500">Page {currentPage} of {totalPages}</span>
          <div className="flex gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="p-2 bg-slate-905 hover:bg-slate-900 border border-slate-900 disabled:opacity-20 disabled:cursor-not-allowed rounded-lg text-slate-400 hover:text-white transition-all duration-300 cursor-pointer"
            >
              <FiChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="p-2 bg-slate-905 hover:bg-slate-900 border border-slate-900 disabled:opacity-20 disabled:cursor-not-allowed rounded-lg text-slate-400 hover:text-white transition-all duration-300 cursor-pointer"
            >
              <FiChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
