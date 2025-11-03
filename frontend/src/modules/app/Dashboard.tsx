import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import SimpleBooksTable from '../books/SimpleBooksTable';
import SimpleUsersTable from '../users/SimpleUsersTable';

const API_BASE = import.meta.env.VITE_API_BASE;

export default function Dashboard() {
  const { token, logout } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'books' | 'users'>('books');

  // Fetch user profile
  useEffect(() => {
    if (token) {
      (async () => {
        try {
          const res = await fetch(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const profile = await res.json();
            setUser(profile);
          }
        } catch (error) {
          console.error('Failed to fetch profile:', error);
        }
      })();
    }
  }, [token]);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      {/* Header */}
      <header style={{
        backgroundColor: "white",
        borderBottom: "1px solid #e5e7eb",
        padding: "1rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <h1 style={{
          fontSize: "1.5rem",
          fontWeight: "bold",
          color: "#1f2937",
          margin: 0
        }}>
          Student Library System
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ color: "#6b7280" }}>
            Welcome, {user?.email} ({user?.role})
          </span>
          <button
            onClick={logout}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "0.375rem",
              cursor: "pointer",
              fontSize: "0.875rem"
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
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

      {/* Main Content */}
      <main style={{ padding: "2rem" }}>
        {activeTab === 'books' && <SimpleBooksTable />}
        {activeTab === 'users' && user?.role === 'admin' && <SimpleUsersTable />}
      </main>
    </div>
  );
}
