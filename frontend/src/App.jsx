import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StockProvider } from './context/StockContext';
import LoadingSpinner from './components/LoadingSpinner';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';

// Lazy load pages for chunk optimizations
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const History = lazy(() => import('./pages/History'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));

const Portfolio = lazy(() => import('./pages/Portfolio'));
const MarketNews = lazy(() => import('./pages/MarketNews'));
const Settings = lazy(() => import('./pages/Settings'));

// Route Guard: redirects unauthenticated operators to Login
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Route Guard: redirects authenticated operators to Dashboard (bypassing guest pages)
function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <StockProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingSpinner size="lg" fullScreen />}>
            <Routes>
              {/* Public Standalone Landing Page */}
              <Route path="/" element={<Home />} />

              {/* Guest Auth Layout */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
              </Route>

              {/* Protected Dashboard Layout */}
              <Route 
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/history" element={<History />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/news" element={<MarketNews />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              {/* 404 Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </StockProvider>
    </AuthProvider>
  );
}
