import { useAuth } from "../../modules/auth/AuthContext";


export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export default function NavTab({ activeTab, setActiveTab }: { activeTab: string | null; setActiveTab: (tab: string | null) => void }) {
    const { user } = useAuth();

  return (
    <nav style={{
        backgroundColor: "white",
        borderBottom: "1px solid #e5e7eb",
        padding: "0 2rem"
      }}>
        <div style={{ display: "flex", gap: "2rem" }}>
          <button
            onClick={() => setActiveTab('books')}
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
          {user?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('users')}
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
          )}
        </div>
      </nav>
  );
}