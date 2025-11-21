import { useAuth } from "../../modules/auth/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import './NavTab.css';

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export default function NavTab() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab from URL
  const getActiveTab = () => {
    const path = location.pathname;
    if (user?.role === 'admin') {
      if (path === '/dashboard/books') return 'books';
      if (path === '/dashboard/users') return 'users';
      if (path === '/dashboard/borrowings') return 'borrowings';
      return null; // Default dashboard view
    } else {
      if (path === '/books') return 'books';
      if (path === '/my-borrowings') return 'my-borrowings';
      if (path === '/borrowing-history') return 'borrowing-history';
      return null; // Default home view
    }
  };

  const activeTab = getActiveTab();

  // Handler for tab clicks - navigate to route
  const handleTabClick = (tab: string) => {
    if (user?.role === 'admin') {
      navigate(`/dashboard/${tab}`);
    } else {
      navigate(`/${tab}`);
    }
  };

  return (
    <nav className="nav-tab-container">
      <div className="nav-tab-wrapper">
        {user?.role === 'student' ? (
          // Student tabs
          <>
            <button
              onClick={() => handleTabClick('books')}
              className={`nav-tab-button student ${activeTab === 'books' ? 'active' : ''}`}
            >
              Book Gallery
            </button>
            <button
              onClick={() => handleTabClick('my-borrowings')}
              className={`nav-tab-button student ${activeTab === 'my-borrowings' ? 'active' : ''}`}
            >
              My Borrowings
            </button>
            <button
              onClick={() => handleTabClick('borrowing-history')}
              className={`nav-tab-button student ${activeTab === 'borrowing-history' ? 'active' : ''}`}
            >
              Borrowing History
            </button>
          </>
        ) : (
          // Admin tabs
          <>
            <button
              onClick={() => handleTabClick('books')}
              className={`nav-tab-button admin ${activeTab === 'books' ? 'active' : ''}`}
            >
              Books Management
            </button>
            <button
              onClick={() => handleTabClick('users')}
              className={`nav-tab-button admin ${activeTab === 'users' ? 'active' : ''}`}
            >
              User Management
            </button>
            <button
              onClick={() => handleTabClick('borrowings')}
              className={`nav-tab-button admin ${activeTab === 'borrowings' ? 'active' : ''}`}
            >
              Borrowing Management
            </button>
          </>
        )}
      </div>
    </nav>
  );
}