import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  FiGrid,
  FiTrendingUp,
  FiUser,
  FiLogOut,
  FiX,
  FiHome,
  FiActivity,
  FiCompass,
  FiBookmark,
  FiSettings,
  FiBriefcase
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: FiGrid },
    { name: 'Virtual Portfolio', path: '/portfolio', icon: FiBriefcase },
    { name: 'Market Overview', path: '#market', icon: FiCompass },
    { name: 'Predictions', path: '#predictions', icon: FiActivity },
    { name: 'Watchlist', path: '#watchlist', icon: FiBookmark },
    { name: 'History', path: '/history', icon: FiTrendingUp },
    { name: 'Profile', path: '/profile', icon: FiUser },
    { name: 'Indicators', path: '#settings', icon: FiSettings }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/90 backdrop-blur-md lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-45 w-64 bg-slate-950/90 backdrop-blur-xl border-r border-slate-900/85 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Header Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-900/80">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-neon-cyan to-neon-purple flex items-center justify-center shadow-lg shadow-neon-cyan/20">
              <span className="font-extrabold text-slate-950 text-base">α</span>
            </div>
            <span className="text-sm font-black tracking-widest text-slate-100 font-mono">
              ALPHA<span className="text-neon-cyan">STOCK</span>
            </span>
          </Link>
          <button
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800/40"
            onClick={() => setIsOpen(false)}
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Links Stack */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto scrollbar-none">
          {links.map((link) => {
            const Icon = link.icon;
            // Support simple hash routing highlights for mock links
            const isActive = link.path.startsWith('#')
              ? location.hash === link.path
              : location.pathname === link.path;

            return link.path.startsWith('#') ? (
              <a
                key={link.name}
                href={link.path}
                onClick={(e) => {
                  e.preventDefault();
                  lgHiddenToggle(setIsOpen);
                  const id = link.path.slice(1);
                  const el = document.getElementById(id);
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-3xs font-extrabold uppercase tracking-widest font-mono transition-all duration-300 group relative border ${isActive
                    ? 'bg-slate-900/80 text-neon-cyan border-slate-800/80 shadow-md shadow-neon-cyan/2'
                    : 'text-slate-450 hover:text-slate-200 hover:bg-slate-900/40 border-transparent'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-colors duration-300 ${isActive ? 'text-neon-cyan' : 'text-slate-500 group-hover:text-slate-350'}`} />
                  <span>{link.name}</span>
                </div>
                {isActive && (
                  <motion.span
                    layoutId="activeIndicator"
                    className="w-1.5 h-1.5 rounded-full bg-neon-cyan shadow-[0_0_8px_#00f0ff]"
                  />
                )}
              </a>
            ) : (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => lgHiddenToggle(setIsOpen)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-3xs font-extrabold uppercase tracking-widest font-mono transition-all duration-300 group relative border ${isActive
                    ? 'bg-slate-900/80 text-neon-cyan border-slate-800/80 shadow-md shadow-neon-cyan/2'
                    : 'text-slate-450 hover:text-slate-200 hover:bg-slate-900/40 border-transparent'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-colors duration-300 ${isActive ? 'text-neon-cyan' : 'text-slate-500 group-hover:text-slate-350'}`} />
                  <span>{link.name}</span>
                </div>
                {isActive && (
                  <motion.span
                    layoutId="activeIndicator"
                    className="w-1.5 h-1.5 rounded-full bg-neon-cyan shadow-[0_0_8px_#00f0ff]"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Workspace Footer details */}
        {user && (
          <div className="p-4 border-t border-slate-900/80 bg-slate-950/20">
            <div className="glass-card rounded-xl p-3 border border-slate-900/80 flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-neon-purple to-pink-500 flex items-center justify-center font-bold text-slate-100 text-xs shadow-md">
                  {user.avatar}
                </div>
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="text-[10px] font-black text-slate-200 truncate uppercase font-mono">{user.name}</p>
                  <span className="text-[8px] font-extrabold text-neon-cyan uppercase tracking-widest font-mono mt-0.5 inline-block">
                    {user.plan}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  logout();
                  window.location.href = '/login';
                }}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-4xs font-black font-mono uppercase tracking-widest bg-slate-950 hover:bg-neon-rose/10 border border-slate-900 hover:border-neon-rose/30 text-slate-500 hover:text-neon-rose transition-all duration-300 cursor-pointer"
              >
                <FiLogOut className="w-3 h-3" />
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

function lgHiddenToggle(setIsOpen) {
  if (window.innerWidth < 1024) {
    setIsOpen(false);
  }
}
