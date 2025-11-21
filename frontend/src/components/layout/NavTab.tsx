import { useAuth } from "../../modules/auth/AuthContext";

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export default function NavTab({ activeTab, setActiveTab }: { activeTab: string | null; setActiveTab: (tab: string | null) => void }) {
    const { user } = useAuth();

  // Handler for tab clicks - just update state, no routing
  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
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
                  borderBottom: activeTab === 'books' ? "3px solid #3b82f6" : "3px solid transparent",
                  color: activeTab === 'books' ? "#3b82f6" : "#6b7280",
                  fontWeight: activeTab === 'books' ? "600" : "500",
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
                  borderBottom: activeTab === 'my-borrowings' ? "3px solid #3b82f6" : "3px solid transparent",
                  color: activeTab === 'my-borrowings' ? "#3b82f6" : "#6b7280",
                  fontWeight: activeTab === 'my-borrowings' ? "600" : "500",
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
                  borderBottom: activeTab === 'borrowing-history' ? "3px solid #3b82f6" : "3px solid transparent",
                  color: activeTab === 'borrowing-history' ? "#3b82f6" : "#6b7280",
                  fontWeight: activeTab === 'borrowing-history' ? "600" : "500",
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