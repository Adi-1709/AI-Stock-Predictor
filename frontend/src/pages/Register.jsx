import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Password Strength Logic
  const [strength, setStrength] = useState(0);
  const [strengthLabel, setStrengthLabel] = useState('');
  const [strengthColor, setStrengthColor] = useState('bg-slate-700');

  useEffect(() => {
    let score = 0;
    if (password.length > 5) score += 1;
    if (password.length > 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    setStrength(score);

    if (score === 0) {
      setStrengthLabel('');
      setStrengthColor('bg-slate-700');
    } else if (score <= 2) {
      setStrengthLabel('Weak');
      setStrengthColor('bg-neon-rose');
    } else if (score <= 4) {
      setStrengthLabel('Good');
      setStrengthColor('bg-amber-400');
    } else {
      setStrengthLabel('Strong');
      setStrengthColor('bg-neon-emerald');
    }
  }, [password]);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }
    
    if (!acceptedTerms) {
      return setError('You must accept the Terms and Conditions.');
    }

    setIsLoading(true);

    try {
      await register(name, email, password);
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (err) {
      setError('Registration failed. Email may already be in use.');
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
        {/* Full Name */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-neon-cyan transition-colors">
            <FiUser className="w-4 h-4" />
          </div>
          <input
            type="text"
            id="name"
            required
            className="block w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-sm text-white placeholder-transparent focus:outline-none focus:ring-1 focus:ring-neon-cyan focus:border-neon-cyan transition-all peer"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <label 
            htmlFor="name" 
            className="absolute left-11 -top-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-950 px-1 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-500 peer-placeholder-shown:top-3 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-[10px] peer-focus:text-neon-cyan peer-focus:bg-slate-950"
          >
            Full Name
          </label>
        </div>

        {/* Email */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-neon-cyan transition-colors">
            <FiMail className="w-4 h-4" />
          </div>
          <input
            type="email"
            id="email"
            required
            className="block w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-sm text-white placeholder-transparent focus:outline-none focus:ring-1 focus:ring-neon-cyan focus:border-neon-cyan transition-all peer"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label 
            htmlFor="email" 
            className="absolute left-11 -top-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-950 px-1 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-500 peer-placeholder-shown:top-3 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-[10px] peer-focus:text-neon-cyan peer-focus:bg-slate-950"
          >
            Email Address
          </label>
        </div>

        {/* Password */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-neon-cyan transition-colors">
            <FiLock className="w-4 h-4" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            required
            className="block w-full pl-11 pr-12 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-sm text-white placeholder-transparent focus:outline-none focus:ring-1 focus:ring-neon-cyan focus:border-neon-cyan transition-all peer"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label 
            htmlFor="password" 
            className="absolute left-11 -top-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-950 px-1 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-500 peer-placeholder-shown:top-3 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-[10px] peer-focus:text-neon-cyan peer-focus:bg-slate-950"
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

        {/* Password Strength Meter */}
        {password.length > 0 && (
          <div className="px-1">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-mono tracking-widest uppercase text-slate-500">Security Level</span>
              <span className={`text-[10px] font-black tracking-widest uppercase ${strengthColor.replace('bg-', 'text-')}`}>
                {strengthLabel}
              </span>
            </div>
            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden flex gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div 
                  key={level} 
                  className={`h-full flex-1 rounded-full transition-all duration-300 ${level <= strength ? strengthColor : 'bg-transparent'}`} 
                />
              ))}
            </div>
          </div>
        )}

        {/* Confirm Password */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-neon-cyan transition-colors">
            <FiLock className="w-4 h-4" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            id="confirmPassword"
            required
            className="block w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-sm text-white placeholder-transparent focus:outline-none focus:ring-1 focus:ring-neon-cyan focus:border-neon-cyan transition-all peer"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <label 
            htmlFor="confirmPassword" 
            className="absolute left-11 -top-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-950 px-1 transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-500 peer-placeholder-shown:top-3 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-[10px] peer-focus:text-neon-cyan peer-focus:bg-slate-950"
          >
            Confirm Password
          </label>
        </div>

        {/* T&C */}
        <div className="pt-2">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative w-4 h-4 rounded border border-slate-600 bg-slate-900 group-hover:border-neon-cyan transition-colors shrink-0 mt-0.5">
              <input 
                type="checkbox" 
                className="absolute opacity-0 cursor-pointer w-full h-full peer" 
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
              />
              <div className="absolute inset-0 bg-neon-cyan rounded opacity-0 peer-checked:opacity-100 transition-opacity flex items-center justify-center">
                <svg className="w-3 h-3 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
            </div>
            <span className="text-[11px] text-slate-400 font-medium leading-snug">
              I acknowledge the risks of automated trading and agree to the <a href="#" className="text-neon-cyan hover:text-white transition-colors">Terms of Service</a> & <a href="#" className="text-neon-cyan hover:text-white transition-colors">Privacy Policy</a>.
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full relative group py-3.5 px-4 bg-slate-100 text-slate-950 font-black rounded-xl overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-[1.02] transition-all duration-300 disabled:opacity-70 disabled:hover:scale-100 mt-2"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan via-white to-neon-purple opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
          <span className="relative z-10 flex items-center justify-center gap-2 text-sm uppercase tracking-wider font-mono">
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Provisioning...
              </>
            ) : (
              'Create AI Trading Account'
            )}
          </span>
        </button>
      </form>

      <div className="mt-8 text-center text-xs text-slate-400 font-medium">
        Already registered?{' '}
        <Link to="/login" className="text-neon-cyan font-bold hover:text-white transition-colors">
          Initialize Session
        </Link>
      </div>
    </div>
  );
}
