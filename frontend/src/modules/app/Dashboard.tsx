import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import PaginatedBooksTable from '../../components/books/PaginatedBooksTable';
import PaginatedUsersTable from '../../components/users/PaginatedUsersTable';
import NavTab from '../../components/layout/NavTab';
import Header from '../../components/layout/Header';

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export default function Dashboard() {
  const { token } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string | null>(null); // Allow null as a valid type

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
      <Header />
      {/* Navigation Tabs */}
      <NavTab activeTab={activeTab} setActiveTab={(tab: string | null) => setActiveTab(tab)} />
      {/* Breadcrumbs */}
      {/* <Breadcrumbs /> */}
      {/* Main Content */}
      <main style={{ padding: "2rem" }}>
        {activeTab === 'books' && <PaginatedBooksTable/ >}
        {activeTab === 'users' && user?.role === 'admin' && <PaginatedUsersTable />}
      </main>
    </div>
  );
}
