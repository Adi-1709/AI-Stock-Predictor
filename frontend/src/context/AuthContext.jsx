import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

// Sandbox fallback user — matches backend sandboxData.js
const SANDBOX_USER = {
  name: 'Alex Mercer',
  email: 'alex@alpha.ai',
  password: 'password123',
  plan: 'Pro Elite',
  avatar: 'AM',
  bio: 'Fintech Analyst & Quantitative Developer.',
  company: 'Alpha AI Capital',
  phone: '+1 (555) 019-2834',
  location: 'New York, NY',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      return true;
    } catch (err) {
      // Sandbox fallback when backend is offline
      if (email === SANDBOX_USER.email && password === SANDBOX_USER.password) {
        const sandboxSession = { ...SANDBOX_USER };
        delete sandboxSession.password;
        setUser(sandboxSession);
        localStorage.setItem('user', JSON.stringify(sandboxSession));
        return true;
      }
      console.error('Login failed:', err.response?.data?.message || err.message);
      throw new Error(err.response?.data?.message || 'Invalid email or password.');
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      return true;
    } catch (err) {
      // Sandbox fallback — auto-register as demo user
      if (name && email && password) {
        const sandboxSession = {
          name,
          email,
          plan: 'Sandbox Trial',
          avatar: name.slice(0, 2).toUpperCase(),
        };
        setUser(sandboxSession);
        localStorage.setItem('user', JSON.stringify(sandboxSession));
        return true;
      }
      console.error('Registration failed:', err.response?.data?.message || err.message);
      throw new Error(err.response?.data?.message || 'Registration failed.');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

