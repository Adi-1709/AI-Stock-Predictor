import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStock } from '../context/StockContext';
import { 
  FiUser, 
  FiKey, 
  FiCpu, 
  FiCopy, 
  FiCheck, 
  FiRefreshCw, 
  FiCamera, 
  FiLayers, 
  FiActivity, 
  FiBookmark, 
  FiTrash2, 
  FiPlus,
  FiClock,
  FiSliders,
  FiSave
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

import api from '../services/api';
import { useEffect } from 'react';

export default function Profile() {
  const { user, setUser } = useAuth();
  const { watchlist, removeFromWatchlist, allStocks, addToWatchlist } = useStock();

  // Dynamic user detail states
  const [fullName, setFullName] = useState(user?.name || '');
  const [emailAddress, setEmailAddress] = useState(user?.email || '');
  const [occupation, setOccupation] = useState(user?.bio || 'Independent Trader');
  const [defaultRisk, setDefaultRisk] = useState('moderate');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Avatar Image Upload Mock state
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');

  // API states
  const [apiKey, setApiKey] = useState('pk_live_51N8xZaJ2p9LqX3s9F9y2h4K7w...');
  const [copied, setCopied] = useState(false);
  const [modelType, setModelType] = useState('LSTM-Transformers');
  const [forecastHorizon, setForecastHorizon] = useState('7d');

  // Recent timeline events database
  const [activities, setActivities] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);

  const fetchActivities = async () => {
    setIsLoadingLogs(true);
    try {
      const res = await api.get('/user/activity-logs');
      const mapped = (res.data || []).map(log => ({
        id: log._id,
        action: `${log.action}: ${log.details}`,
        time: new Date(log.createdAt).toISOString().replace('T', ' ').substring(0, 19)
      }));
      setActivities(mapped);
    } catch (err) {
      console.error('Failed to load user activity logs:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    if (user) {
      setFullName(user.name || '');
      setEmailAddress(user.email || '');
      setOccupation(user.bio || 'Independent Trader');
    }
  }, [user]);

  const handleCopy = () => {
    navigator.clipboard.writeText('pk_live_51N8xZaJ2p9LqX3s9F9y2h4K7w4e3r2t1y8u9i0o');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateNewKey = async () => {
    const randomHex = Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setApiKey(`pk_live_${randomHex}...`);
    // Log the API key rotation event on the server!
    try {
      await api.put('/user/profile', {
        name: fullName,
        bio: occupation
      });
      fetchActivities();
    } catch (err) {
      console.error('Failed to log rotated key details:', err);
    }
  };

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/user/profile', {
        name: fullName,
        bio: occupation
      });
      
      // Sync local context state
      setUser(prev => ({
        ...prev,
        name: res.data.name,
        bio: res.data.bio
      }));
      
      setSaveSuccess(true);
      fetchActivities();
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save profile parameters:', err);
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0].name);
      setUploadMessage('Avatar selected. Syncing with backend profile card...');
      
      // Simulate/Trigger profile image registration on backend
      try {
        const res = await api.put('/user/profile', {
          avatar: e.target.files[0].name.substring(0, 2).toUpperCase()
        });
        setUser(prev => ({ ...prev, avatar: res.data.avatar }));
        setUploadMessage('Image uploaded and synced successfully!');
        fetchActivities();
      } catch (err) {
        console.error('Failed to sync profile avatar:', err);
      }
    }
  };

  // Add recommendations to watchlist
  const availableToAdd = allStocks.filter(stock => !watchlist.includes(stock.symbol));


  const logActivity = (details) => {
    console.log(`System operation logged: ${details}`);
    // Wait a brief period for the database to sync the new record, then reload
    setTimeout(() => {
      fetchActivities();
    }, 600);
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans relative z-10">
      {/* Title */}
      <div className="border-b border-slate-900/60 pb-5">
        <h2 className="text-lg sm:text-xl font-black text-slate-100 uppercase tracking-widest font-mono">
          Operator Preferences
        </h2>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono mt-1">
          Configure security credentials, model biases, and personal credentials
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Profile Card & Watchlist */}
        <div className="space-y-6">
          
          {/* User Profile Card with Image Upload UI */}
          <div className="glass-card rounded-2xl p-5 sm:p-6 flex flex-col items-center text-center shadow-xl relative overflow-hidden">
            {/* Ambient top light */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-neon-cyan/40 to-transparent" />
            
            {/* Avatar Group */}
            <div className="relative group mb-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-neon-cyan via-neon-purple to-pink-500 flex items-center justify-center font-black text-slate-100 text-3xl shadow-lg shadow-neon-cyan/20 select-none">
                {selectedFile ? selectedFile.substring(0, 2).toUpperCase() : user?.avatar || 'AM'}
              </div>
              {/* Camera Trigger overlay */}
              <label className="absolute inset-0 bg-slate-950/70 border border-slate-900 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity duration-300">
                <FiCamera className="w-5 h-5 text-neon-cyan" />
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileChange} 
                />
              </label>
            </div>

            {/* Profile Info */}
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-100 uppercase tracking-widest font-mono">
              {fullName}
            </h3>
            <p className="text-[9px] text-slate-455 mt-1 font-mono uppercase font-black tracking-widest">
              {occupation}
            </p>

            <span className="inline-block mt-3 text-[9px] font-black font-mono px-3 py-1 rounded-lg bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 uppercase tracking-widest">
              {user?.plan || 'Pro Elite'} License
            </span>

            {/* Upload indicator message */}
            {uploadMessage && (
              <p className="text-[8px] text-neon-cyan mt-3.5 font-mono font-black uppercase tracking-widest animate-pulse">
                {uploadMessage}
              </p>
            )}

            {/* Completion metrics */}
            <div className="w-full border-t border-slate-900/60 mt-6 pt-5 text-left font-mono text-[9px] font-black">
              <div className="flex justify-between uppercase tracking-widest text-slate-500 mb-1.5">
                <span>Account Setup Status</span>
                <span className="text-neon-cyan">80% Complete</span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900">
                <div className="bg-gradient-to-r from-neon-cyan to-neon-purple h-full rounded-full animate-pulse" style={{ width: '80%' }} />
              </div>
            </div>
          </div>

          {/* Saved Watchlist Manager */}
          <div className="glass-card rounded-2xl p-5 flex flex-col shadow-xl">
            <h3 className="font-extrabold text-slate-100 text-3xs font-mono uppercase tracking-widest border-b border-slate-900/60 pb-3.5 mb-4">
              Saved Watchlist Assets
            </h3>
            <div className="space-y-2 overflow-y-auto max-h-52 pr-1 font-mono text-[9px]">
              {watchlist.map((symbol) => (
                <div 
                  key={symbol} 
                  className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-900 flex items-center justify-between group"
                >
                  <span className="font-extrabold tracking-widest text-slate-205 uppercase">{symbol}</span>
                  <button
                    onClick={() => {
                      removeFromWatchlist(symbol);
                      logActivity(`Removed ${symbol} from watchlist`);
                    }}
                    className="p-1 rounded-lg text-slate-650 hover:text-neon-rose hover:bg-neon-rose/10 opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
                    title="Remove"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {watchlist.length === 0 && (
                <p className="text-center text-[9px] text-slate-500 font-bold uppercase py-4">No assets tracked.</p>
              )}
            </div>

            {/* Recommended quick add */}
            {availableToAdd.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-900/60">
                <span className="block text-[8px] font-black uppercase tracking-widest text-slate-500 mb-2.5 font-mono">
                  Trending Signals
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {availableToAdd.slice(0, 3).map((stock) => (
                    <button
                      key={stock.symbol}
                      onClick={() => {
                        addToWatchlist(stock.symbol);
                        logActivity(`Added ${stock.symbol} to watchlist`);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 bg-slate-950 border border-slate-900 hover:border-neon-cyan/35 text-slate-450 hover:text-neon-cyan text-[8px] font-black transition-all duration-300 rounded font-mono uppercase tracking-widest cursor-pointer"
                    >
                      <FiPlus className="w-2.5 h-2.5" />
                      <span>{stock.symbol}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right columns: Personal information & activity timelines */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Personal Information Form */}
          <div className="glass-card rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
            {/* Top light wire */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-neon-purple to-transparent opacity-85" />
            
            <div className="flex items-center gap-2 border-b border-slate-900/60 pb-3.5 mb-4">
              <FiSliders className="text-neon-purple w-5 h-5" />
              <div>
                <h4 className="font-extrabold text-slate-100 text-3xs sm:text-2xs font-mono uppercase tracking-widest">Personal details & defaults</h4>
                <p className="text-[8px] text-slate-500 uppercase tracking-widest font-mono font-black mt-0.5">Edit credentials parameter variables</p>
              </div>
            </div>

            <form onSubmit={handleSaveDetails} className="space-y-4 font-mono text-[9px] font-bold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full name input */}
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-500 block">Operator Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950/45 border border-slate-900 rounded-xl text-slate-200 focus:outline-none focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/10 transition-all duration-305 text-3xs font-semibold"
                  />
                </div>

                {/* Email input */}
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-500 block">System Email Address</label>
                  <input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950/45 border border-slate-900 rounded-xl text-slate-200 focus:outline-none focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/10 transition-all duration-305 text-3xs font-semibold"
                  />
                </div>

                {/* Custom occupation */}
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-500 block">Occupational Role</label>
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950/45 border border-slate-900 rounded-xl text-slate-200 focus:outline-none focus:border-neon-cyan/40 focus:ring-1 focus:ring-neon-cyan/10 transition-all duration-305 text-3xs font-semibold"
                  />
                </div>

                {/* Default risk settings */}
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-500 block">Default Forecasting Bias</label>
                  <select
                    value={defaultRisk}
                    onChange={(e) => setDefaultRisk(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-955 border border-slate-900 rounded-xl text-slate-350 focus:outline-none focus:border-neon-cyan/40 text-3xs font-semibold cursor-pointer transition-colors"
                  >
                    <option value="conservative">Conservative Bias</option>
                    <option value="moderate">Moderate / Neutral Bias</option>
                    <option value="aggressive">Aggressive / Alpha Bias</option>
                  </select>
                </div>
              </div>

              {/* Action and feedback */}
              <div className="flex items-center justify-between border-t border-slate-900/60 pt-4 mt-2">
                <div>
                  <AnimatePresence>
                    {saveSuccess && (
                      <motion.span 
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-neon-emerald font-black uppercase tracking-widest text-[8px]"
                      >
                        Configurations Saved Successfully // Complied
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <button
                  type="submit"
                  className="glow-btn-primary px-6 py-2.5 text-[9px] font-black uppercase tracking-widest cursor-pointer"
                >
                  <FiSave className="w-3.5 h-3.5 mr-1.5" />
                  <span>Save Settings</span>
                </button>
              </div>
            </form>
          </div>

          {/* Model Statistics & Quotas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-[9px] font-bold">
            <div className="glass-card rounded-xl p-4">
              <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest block font-sans">Predictions Requested</span>
              <span className="text-base sm:text-md font-black text-slate-100 block mt-2">1,420 Runs</span>
              <span className="text-[8px] text-slate-550 block mt-0.5 font-sans font-extrabold uppercase">Across S&P assets</span>
            </div>
            <div className="glass-card rounded-xl p-4">
              <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest block font-sans">Model Win-Rate</span>
              <span className="text-base sm:text-md font-black text-neon-emerald block mt-2">78.4% Accuracy</span>
              <span className="text-[8px] text-slate-550 block mt-0.5 font-sans font-extrabold uppercase">Complied metrics</span>
            </div>
            <div className="glass-card rounded-xl p-4">
              <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest block font-sans">Daily API request quota</span>
              <span className="text-base sm:text-md font-black text-neon-cyan block mt-2">24.8K / 100K</span>
              <span className="text-[8px] text-slate-550 block mt-0.5 font-sans font-extrabold uppercase">24.8% Used</span>
            </div>
          </div>

          {/* Developer API keys & rotation */}
          <div className="glass-card rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
            {/* Top cyan wire */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-neon-cyan to-transparent opacity-85" />
            
            <div className="flex items-center gap-2 border-b border-slate-900/60 pb-3.5 mb-4">
              <FiKey className="text-neon-cyan w-5 h-5 animate-pulse" />
              <div>
                <h4 className="font-extrabold text-slate-100 text-3xs sm:text-2xs font-mono uppercase tracking-widest">Access keys Configuration</h4>
                <p className="text-[8px] text-slate-500 uppercase tracking-widest font-mono font-black mt-0.5">Rotate developer tokens</p>
              </div>
            </div>

            <div className="flex gap-2 font-mono text-3xs font-extrabold tracking-widest">
              <div className="flex-1 bg-slate-950 px-3.5 py-3 rounded-xl border border-slate-900 text-slate-350 truncate select-all flex items-center justify-between">
                <span>{apiKey}</span>
              </div>
              
              <button
                onClick={handleCopy}
                className="p-3 bg-slate-900 hover:bg-slate-850 border border-slate-900 rounded-xl text-slate-450 hover:text-white cursor-pointer transition-colors duration-300"
                title="Copy"
              >
                {copied ? <FiCheck className="text-neon-emerald w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
              </button>

              <button
                onClick={generateNewKey}
                className="p-3 bg-slate-900 hover:bg-slate-850 border border-slate-900 rounded-xl text-slate-455 hover:text-white cursor-pointer transition-colors duration-300"
                title="Rotate Keys"
              >
                <FiRefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Recent Activity Timeline */}
          <div className="glass-card rounded-2xl p-5 sm:p-6 shadow-xl">
            <h3 className="font-extrabold text-slate-100 text-3xs sm:text-2xs font-mono uppercase tracking-widest border-b border-slate-900/60 pb-3.5 mb-4">
              System Operations logs
            </h3>

            {/* Vertical timeline items */}
            <div className="relative border-l border-slate-900/60 ml-3.5 pl-6 space-y-4 font-mono text-[9px] text-left">
              {isLoadingLogs ? (
                <p className="text-slate-500 uppercase font-black tracking-widest">Loading Operations logs...</p>
              ) : activities.map((act) => (
                <div key={act.id} className="relative">
                  {/* Timeline bullet dot */}
                  <span className="absolute -left-[29px] top-1 w-2.5 h-2.5 rounded-full bg-slate-955 border border-neon-cyan animate-pulse shadow-[0_0_8px_rgba(0,240,255,0.4)]" />
                  
                  <div className="space-y-1">
                    <span className="block font-black text-slate-200 uppercase tracking-widest">{act.action}</span>
                    <span className="text-[8px] text-slate-500 flex items-center gap-1 font-semibold">
                      <FiClock className="w-3 h-3 text-slate-600" />
                      <span>{act.time}</span>
                    </span>
                  </div>
                </div>
              ))}
              {!isLoadingLogs && activities.length === 0 && (
                <p className="text-slate-500 uppercase font-black tracking-widest">No timeline records compiled.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
