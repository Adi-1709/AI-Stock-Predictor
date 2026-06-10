import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiGithub } from 'react-icons/fi';
import { FaGoogle } from 'react-icons/fa'; // Might not be installed, let's stick to simple icons or install it. Wait, I will use an SVG for Google just in case react-icons/fa is not imported.
// Actually, react-icons has many suites. I'll use simple text or SVGs to avoid breaking.

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      // Simulate slight network delay for premium feel
      setTimeout(() => {
        navigate('/dashboard');
      }, 600);
    } catch (err) {
      setError('Invalid operator credentials. Please verify your access codes.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-neon-rose/10 border border-neon-rose/30 flex items-start gap-3 animate-pulse-slow">
          <div className="w-5 h-5 rounded-full bg-neon-rose/20 flex items-center justify-center text-neon-rose shrink-0 mt-0.5">
            <span className="text-xs font-black">!</span>
          </div>
          <p className="text-xs text-neon-rose font-medium leading-relaxed">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Input */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-neon-cyan transition-colors">
            <FiMail className="w-4 h-4" />
          </div>
          <input
            type="email"
            id="email"
            required
            className="block w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-700 rounded-xl text-sm text-white placeholder-transparent focus:outline-none focus:ring-1 focus:ring-neon-cyan focus:border-neon-cyan transition-all peer"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label 
            htmlFor="email" 
            className="absolute left-11 -top-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-950 px-1 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-500 peer-placeholder-shown:top-3.5 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-[10px] peer-focus:text-neon-cyan peer-focus:bg-slate-950"
          >
            Email Address
          </label>
        </div>

        {/* Password Input */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-neon-cyan transition-colors">
            <FiLock className="w-4 h-4" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            required
            className="block w-full pl-11 pr-12 py-3.5 bg-slate-900/50 border border-slate-700 rounded-xl text-sm text-white placeholder-transparent focus:outline-none focus:ring-1 focus:ring-neon-cyan focus:border-neon-cyan transition-all peer"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label 
            htmlFor="password" 
            className="absolute left-11 -top-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-950 px-1 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-500 peer-placeholder-shown:top-3.5 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-[10px] peer-focus:text-neon-cyan peer-focus:bg-slate-950"
          >
            Password
          </label>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors focus:outline-none"
          >
            {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
          </button>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative w-4 h-4 rounded border border-slate-600 bg-slate-900 group-hover:border-neon-cyan transition-colors">
              <input type="checkbox" className="absolute opacity-0 cursor-pointer w-full h-full peer" />
              <div className="absolute inset-0 bg-neon-cyan rounded opacity-0 peer-checked:opacity-100 transition-opacity flex items-center justify-center">
                <svg className="w-3 h-3 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
            </div>
            <span className="text-[11px] text-slate-400 font-medium group-hover:text-slate-300 transition-colors">Remember device</span>
          </label>
          
          <Link to="/forgot-password" className="text-[11px] text-neon-cyan hover:text-white transition-colors font-medium">
            Recover Access?
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
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
                Authenticating...
              </>
            ) : (
              'Initialize Session'
            )}
          </span>
        </button>
      </form>

      {/* Social Logins */}
      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-slate-950 text-slate-500 font-mono tracking-widest uppercase text-[9px]">Or continue with</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <button className="flex justify-center items-center gap-2 w-full py-2.5 px-4 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-all text-xs font-black font-mono tracking-wider">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
            </svg>
            Google
          </button>
          <button className="flex justify-center items-center gap-2 w-full py-2.5 px-4 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-all text-xs font-black font-mono tracking-wider">
            <FiGithub className="w-4 h-4" />
            GitHub
          </button>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-slate-400 font-medium">
        Don't have clearance?{' '}
        <Link to="/register" className="text-neon-cyan font-bold hover:text-white transition-colors">
          Request Access
        </Link>
      </div>
    </div>
  );
}
