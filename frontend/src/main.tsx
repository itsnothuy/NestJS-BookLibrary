import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HeroUIProvider } from '@heroui/react';
import { AuthProvider, useAuth } from './modules/auth/AuthContext';
import { BorrowingProvider } from './modules/borrowing/BorrowingContext';
import Login from './modules/auth/Login';
import Signup from './modules/auth/Signup';
import Profile from './modules/auth/Profile';
import Dashboard from './modules/app/Dashboard';
import StudentLayout from './modules/app/StudentLayout';
import './index.css';

function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { isAuthenticated, loading } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#6b7280'
      }}>
        Loading...
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function HomeRedirect() {
  const { user } = useAuth();
  
  // Students see StudentLayout (centralized with tabs), admins go to dashboard
  if (user?.role === 'student') {
    return <StudentLayout />;
  }
  
  if (user?.role === 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Navigate to="/login" replace />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HeroUIProvider>
      <AuthProvider>
        <BorrowingProvider>
          <BrowserRouter>
            <Routes>
              {/* Home route - students see StudentDashboard, admins redirected to /dashboard */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <HomeRedirect />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              {/* Dashboard route - admin only */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </BorrowingProvider>
      </AuthProvider>
    </HeroUIProvider>
  </React.StrictMode>
);
