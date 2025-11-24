import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HeroUIProvider } from '@heroui/react';
import { AuthProvider, useAuth } from './modules/auth/AuthContext';
import { BorrowingProvider } from './modules/borrowing/BorrowingContext';
import { BooksProvider } from './modules/books/BooksContext';
import { UsersProvider } from './modules/users/UsersContext';
import Login from './modules/auth/Login';
import Signup from './modules/auth/Signup';
import Profile from './modules/auth/Profile';
import Dashboard from './modules/app/Dashboard';
import StudentLayout from './modules/app/StudentLayout';
import HomeBanner from './components/home/HomeBanner';
import BookCarousel from './components/home/BookCarousel';
import FeaturedSection from './components/home/FeaturedSection';
import StudentBooksPage from './components/books/StudentBooksPage';
import { MyBorrowings } from './components/borrowing/MyBorrowings';
import { BorrowingHistory } from './components/borrowing/BorrowingHistory';
import PaginatedBooksTable from './components/books/PaginatedBooksTable';
import PaginatedUsersTable from './components/users/PaginatedUsersTable';
import { AdminBorrowingManager } from './components/borrowing/AdminBorrowingManager';
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

// Default home view component for students
function StudentHome() {
  return (
    <>
      <HomeBanner />
      <BookCarousel />
      <FeaturedSection />
    </>
  );
}

// Default dashboard stats view for admins
function DashboardStats() {
  return (
    <div className="dashboard-welcome">
      <h2>Welcome to Dashboard</h2>
      <p>Select a tab above to manage books, users, or borrowings.</p>
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Quick Stats</h3>
          <p>Use the navigation tabs above to access different management sections.</p>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HeroUIProvider>
      <AuthProvider>
        <BooksProvider>
          <UsersProvider>
            <BorrowingProvider>
              <BrowserRouter>
                <Routes>
              {/* Auth routes */}
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
              
              {/* Student routes - wrapped in StudentLayout */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <StudentLayout />
                  </ProtectedRoute>
                }
              >
                {/* Default home view - index route */}
                <Route index element={<StudentHome />} />
                {/* Tab routes */}
                <Route path="books" element={<StudentBooksPage />} />
                <Route path="my-borrowings" element={<MyBorrowings />} />
                <Route path="borrowing-history" element={<BorrowingHistory />} />
              </Route>
              
              {/* Admin routes - wrapped in Dashboard */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              >
                {/* Default dashboard view - index route */}
                <Route index element={<DashboardStats />} />
                {/* Tab routes */}
                <Route path="books" element={<PaginatedBooksTable />} />
                <Route path="users" element={<PaginatedUsersTable />} />
                <Route path="borrowings" element={<AdminBorrowingManager />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </BorrowingProvider>
      </UsersProvider>
    </BooksProvider>
  </AuthProvider>
</HeroUIProvider>
  </React.StrictMode>
);
