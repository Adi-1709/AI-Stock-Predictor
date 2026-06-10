import React from 'react';
import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiCpu } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 text-slate-400 py-10 px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center">
            <span className="font-bold text-slate-950 text-base">α</span>
          </div>
          <span className="text-md font-bold text-slate-200">
            AlphaStock<span className="text-emerald-400 font-semibold text-2xs uppercase ml-0.5">AI</span>
          </span>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-6 text-sm">
          <Link to="/" className="hover:text-white transition-colors duration-200">Home</Link>
          <Link to="/dashboard" className="hover:text-white transition-colors duration-200">Dashboard</Link>
          <Link to="/history" className="hover:text-white transition-colors duration-200">Accuracy Logs</Link>
          <a href="#" className="hover:text-white transition-colors duration-200">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors duration-200">Terms of Service</a>
        </div>

        {/* Social / Info */}
        <div className="flex items-center gap-4">
          <a href="#" className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all duration-200">
            <FiTwitter className="w-4 h-4" />
          </a>
          <a href="#" className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all duration-200">
            <FiGithub className="w-4 h-4" />
          </a>
          <div className="flex items-center gap-1.5 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-mono">
            <FiCpu className="w-3.5 h-3.5 animate-pulse" />
            <span>v1.2.0-beta</span>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto text-center md:text-left mt-8 pt-6 border-t border-slate-900/60 text-2xs text-slate-600">
        © {new Date().getFullYear()} AlphaStock AI. Powered by neural forecasting engines. Standard investment risks apply. Predictions do not constitute financial advice.
      </div>
    </footer>
  );
}
