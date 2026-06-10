import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AIChatbot from '../components/AIChatbot';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex font-sans overflow-hidden relative">
      {/* Top linear glow line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-emerald opacity-60 z-50 animate-pulse" />
      
      {/* Premium background mesh and overlay gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(188,52,250,0.08),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(0,240,255,0.06),transparent_60%)] pointer-events-none z-0" />
      <div className="absolute inset-0 grid-mesh-subtle opacity-40 pointer-events-none z-0" />
      
      {/* Glowing Neon Blobs */}
      <div className="glow-cyan -top-20 -right-20 z-0 opacity-40 animate-pulse" style={{ animationDuration: '10s' }} />
      <div className="glow-purple -bottom-40 left-1/4 z-0 opacity-30 animate-pulse" style={{ animationDuration: '15s' }} />
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-neon-emerald/3 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Soft Floating Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="particle particle-1" />
        <div className="particle particle-2" />
        <div className="particle particle-3 animate-pulse" />
        <div className="particle particle-4" />
        <div className="particle particle-5" />
      </div>

      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative h-screen z-10 scrollbar-none">
        {/* Transparent Blur Sticky Navbar */}
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} isSidebarOpen={sidebarOpen} />

        {/* Content outlet wrapper */}
        <motion.main 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex flex-col gap-6 relative"
        >
          <Outlet />
        </motion.main>

        {/* Footer */}
        <div className="border-t border-slate-800/40 bg-slate-950/70 backdrop-blur-md">
          <Footer />
        </div>
      </div>
      
      {/* Floating AI Stock Assistant Chatbot */}
      <AIChatbot />
    </div>
  );
}
