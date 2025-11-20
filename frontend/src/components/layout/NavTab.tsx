import { useAuth } from "../../modules/auth/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";


export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export default function NavTab({ activeTab, setActiveTab }: { activeTab: string | null; setActiveTab: (tab: string | null) => void }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

  // Determine active tab from location for student pages
  const getActiveTabFromLocation = () => {
    if (location.pathname === '/my-borrowings') return 'my-borrowings';
    if (location.pathname === '/borrowing-history') return 'borrowing-history';
    if (location.pathname === '/student/books') return 'books';
    return activeTab;
  };

  const currentTab = user?.role === 'student' ? getActiveTabFromLocation() : activeTab;

  // Handler for tab clicks
  const handleTabClick = (tab: string) => {
    if (user?.role === 'student') {
      // Student tabs - navigate to different pages
      if (tab === 'books') {
        navigate('/student/books');
      } else if (tab === 'my-borrowings') {
        navigate('/my-borrowings');
      } else if (tab === 'borrowing-history') {
        navigate('/borrowing-history');
      }
    } else {
      // Admin tabs - update activeTab state (same page)
      setActiveTab(tab);
    }
  };

  return (
    <nav style={{
        backgroundColor: "white",
        borderBottom: "1px solid #e5e7eb",
        padding: "0 2rem"
      }}>
        <div style={{ display: "flex", gap: "2rem" }}>
          {user?.role === 'student' ? (
            // Student tabs
            <>
              <button
                onClick={() => handleTabClick('books')}
                style={{
                  padding: "1rem 0",
                  backgroundColor: "transparent",
                  border: "none",
                  borderBottom: currentTab === 'books' ? "2px solid #3b82f6" : "2px solid transparent",
                  color: currentTab === 'books' ? "#3b82f6" : "#6b7280",
                  fontWeight: currentTab === 'books' ? "600" : "400",
                  cursor: "pointer",
                  fontSize: "1rem"
                }}
              >
                Book Gallery
              </button>
              <button
                onClick={() => handleTabClick('my-borrowings')}
                style={{
                  padding: "1rem 0",
                  backgroundColor: "transparent",
                  border: "none",
                  borderBottom: currentTab === 'my-borrowings' ? "2px solid #3b82f6" : "2px solid transparent",
                  color: currentTab === 'my-borrowings' ? "#3b82f6" : "#6b7280",
                  fontWeight: currentTab === 'my-borrowings' ? "600" : "400",
                  cursor: "pointer",
                  fontSize: "1rem"
                }}
              >
                My Borrowings
              </button>
              <button
                onClick={() => handleTabClick('borrowing-history')}
                style={{
                  padding: "1rem 0",
                  backgroundColor: "transparent",
                  border: "none",
                  borderBottom: currentTab === 'borrowing-history' ? "2px solid #3b82f6" : "2px solid transparent",
                  color: currentTab === 'borrowing-history' ? "#3b82f6" : "#6b7280",
                  fontWeight: currentTab === 'borrowing-history' ? "600" : "400",
                  cursor: "pointer",
                  fontSize: "1rem"
                }}
              >
                Borrowing History
              </button>
            </>
          ) : (
            // Admin tabs
            <>
              <button
                onClick={() => handleTabClick('books')}
                style={{
                  padding: "1rem 0",
                  backgroundColor: "transparent",
                  border: "none",
                  borderBottom: activeTab === 'books' ? "2px solid #3b82f6" : "2px solid transparent",
                  color: activeTab === 'books' ? "#3b82f6" : "#6b7280",
                  fontWeight: activeTab === 'books' ? "600" : "400",
                  cursor: "pointer",
                  fontSize: "1rem"
                }}
              >
                Books Management
              </button>
              <button
                onClick={() => handleTabClick('users')}
                style={{
                  padding: "1rem 0",
                  backgroundColor: "transparent",
                  border: "none",
                  borderBottom: activeTab === 'users' ? "2px solid #3b82f6" : "2px solid transparent",
                  color: activeTab === 'users' ? "#3b82f6" : "#6b7280",
                  fontWeight: activeTab === 'users' ? "600" : "400",
                  cursor: "pointer",
                  fontSize: "1rem"
                }}
              >
                User Management
              </button>
              <button
                onClick={() => handleTabClick('borrowings')}
                style={{
                  padding: "1rem 0",
                  backgroundColor: "transparent",
                  border: "none",
                  borderBottom: activeTab === 'borrowings' ? "2px solid #3b82f6" : "2px solid transparent",
                  color: activeTab === 'borrowings' ? "#3b82f6" : "#6b7280",
                  fontWeight: activeTab === 'borrowings' ? "600" : "400",
                  cursor: "pointer",
                  fontSize: "1rem"
                }}
              >
                Borrowing Management
              </button>
            </>
          )}
        </div>
      </nav>
  );
}