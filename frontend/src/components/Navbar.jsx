import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FiMenu, FiBell, FiSettings, FiGrid, FiCompass, FiActivity, FiBookmark, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ toggleSidebar, isSidebarOpen }) {
  const { user } = useAuth();
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/dashboard', icon: FiGrid },
    { name: 'Markets', path: '#market', icon: FiCompass },
    { name: 'Predictions', path: '#predictions', icon: FiActivity },
    { name: 'Watchlist', path: '#watchlist', icon: FiBookmark },
    { name: 'Profile', path: '/profile', icon: FiUser }
  ];

  const handleNavClick = (e, path) => {
    if (path.startsWith('#')) {
      e.preventDefault();
      if (location.pathname !== '/dashboard') {
        window.location.href = '/dashboard' + path;
      } else {
        const id = path.slice(1);
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
  };

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-[#060913]/70 border-b border-slate-900/80 h-16 flex items-center justify-between px-4 sm:px-6">
      
      {/* Left section: Toggle + Brand Logo */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-xl text-slate-400 hover:text-neon-cyan hover:bg-slate-900/80 border border-slate-800/80 lg:hidden transition-all duration-300"
        >
          <FiMenu className="w-5 h-5" />
        </button>

        {/* Brand Logo inside Navbar */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-neon-cyan to-neon-purple flex items-center justify-center shadow-md shadow-neon-cyan/20">
            <span className="font-extrabold text-slate-950 text-xs">α</span>
          </div>
          <span className="text-[11px] font-black tracking-widest text-slate-200 font-mono hidden sm:inline-block">
            ALPHA<span className="text-neon-cyan">STOCK</span>
          </span>
        </Link>
      </div>

      {/* Middle section: Horizontal desktop nav links */}
      <nav className="hidden lg:flex items-center gap-1.5 font-mono text-[9px] font-black uppercase tracking-widest">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isHash = link.path.startsWith('#');
          const isActive = isHash 
            ? location.hash === link.path && location.pathname === '/dashboard'
            : location.pathname === link.path;

          return isHash ? (
            <a
              key={link.name}
              href={link.path}
              onClick={(e) => handleNavClick(e, link.path)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all duration-300 ${
                isActive
                  ? 'bg-slate-900/80 text-neon-cyan border-slate-800/80 shadow-[0_0_10px_rgba(0,240,255,0.06)]'
                  : 'text-slate-450 hover:text-slate-200 hover:bg-slate-900/30 border-transparent hover:border-slate-800/30'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{link.name}</span>
            </a>
          ) : (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all duration-300 ${
                isActive
                  ? 'bg-slate-900/80 text-neon-cyan border-slate-800/80 shadow-[0_0_10px_rgba(0,240,255,0.06)]'
                  : 'text-slate-450 hover:text-slate-200 hover:bg-slate-900/30 border-transparent hover:border-slate-800/30'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Right section: System stats, alerts, profile */}
      <div className="flex items-center gap-3">
        {/* Model status pill */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-900/35 border border-slate-900 px-3.5 py-1.5 rounded-xl text-[10px] font-black font-mono">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-emerald opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-neon-emerald"></span>
          </span>
          <span className="text-slate-500 uppercase tracking-widest text-[7px] font-bold">Model Status:</span>
          <span className="text-neon-emerald tracking-widest text-[7px] font-black">ONLINE</span>
        </div>

        {/* Notifications */}
        <button className="p-2 rounded-xl text-slate-400 hover:text-neon-cyan hover:bg-slate-900/60 border border-slate-900 relative transition-all duration-300 cursor-pointer">
          <FiBell className="w-3.5 h-3.5" />
          <span className="absolute top-1.5 right-1.5 w-1 h-1 rounded-full bg-neon-cyan shadow-[0_0_6px_#00f0ff]" />
        </button>

        {/* Settings */}
        <Link 
          to="/profile" 
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900/60 border border-slate-900 transition-all duration-300"
        >
          <FiSettings className="w-3.5 h-3.5" />
        </Link>

        {/* User profile details */}
        {user && (
          <div className="hidden md:flex items-center gap-2.5 border-l border-slate-900 pl-3.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-neon-cyan to-neon-purple text-slate-950 flex items-center justify-center font-black text-2xs select-none shadow-[0_0_10px_rgba(0,240,255,0.1)]">
              {user.avatar}
            </div>
            <div className="text-left leading-none">
              <span className="block text-[9px] font-black text-slate-200 uppercase tracking-widest font-mono">{user.name}</span>
              <span className="text-[7px] font-extrabold text-slate-500 font-mono tracking-widest mt-0.5 block">LEVEL-3</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
