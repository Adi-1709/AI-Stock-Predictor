import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiCheckCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1200);
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <motion.form 
            key="form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={handleSubmit} 
            className="space-y-6"
          >
            {/* Email Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-neon-cyan transition-colors">
                <FiMail className="w-4 h-4" />
              </div>
              <input
                type="email"
                id="reset-email"
                required
                className="block w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-700 rounded-xl text-sm text-white placeholder-transparent focus:outline-none focus:ring-1 focus:ring-neon-cyan focus:border-neon-cyan transition-all peer"
                placeholder="Account Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label 
                htmlFor="reset-email" 
                className="absolute left-11 -top-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-950 px-1 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-500 peer-placeholder-shown:top-3.5 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-[10px] peer-focus:text-neon-cyan peer-focus:bg-slate-950"
              >
                Account Email
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full relative group py-3.5 px-4 bg-slate-100 text-slate-950 font-black rounded-xl overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-[1.02] transition-all duration-300 disabled:opacity-70 disabled:hover:scale-100"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan via-white to-neon-purple opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
              <span className="relative z-10 flex items-center justify-center gap-2 text-sm uppercase tracking-wider font-mono">
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Send Reset Instructions'
                )}
              </span>
            </button>
          </motion.form>
        ) : (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 py-6"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-neon-emerald/10 border border-neon-emerald/30 flex items-center justify-center text-neon-emerald shadow-[0_0_30px_rgba(0,255,102,0.2)]">
              <FiCheckCircle className="w-10 h-10" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-black text-white tracking-tight">Transmission Sent</h3>
              <p className="text-sm text-slate-400 font-medium">
                Reset instructions have been successfully dispatched to <br/>
                <span className="text-neon-cyan font-mono mt-1 block">{email}</span>
              </p>
            </div>

            <button
              onClick={() => setIsSubmitted(false)}
              className="mt-4 text-xs text-slate-500 hover:text-white transition-colors font-medium font-mono uppercase tracking-widest"
            >
              Didn't receive it? Try again
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 text-center text-xs text-slate-400 font-medium">
        Remembered your clearance?{' '}
        <Link to="/login" className="text-neon-purple font-bold hover:text-white transition-colors">
          Return to Login
        </Link>
      </div>
    </div>
  );
}
