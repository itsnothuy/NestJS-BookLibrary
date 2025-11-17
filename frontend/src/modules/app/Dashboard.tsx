import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import PaginatedBooksTable from '../../components/books/PaginatedBooksTable';
import PaginatedUsersTable from '../../components/users/PaginatedUsersTable';
import NavTab from '../../components/layout/NavTab';
import Header from '../../components/layout/Header';
import './Dashboard.css';

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string | null>(null); // Allow null as a valid type

  return (
    <div className="dashboard-container">
      {/* Header */}
      <Header />
      {/* Navigation Tabs */}
      <NavTab activeTab={activeTab} setActiveTab={(tab: string | null) => setActiveTab(tab)} />
      {/* Breadcrumbs */}
      {/* <Breadcrumbs /> */}
      {/* Main Content */}
      <main className="dashboard-main">
        {activeTab === 'books' && <PaginatedBooksTable/ >}
        {activeTab === 'users' && user?.role === 'admin' && <PaginatedUsersTable />}
      </main>
    </div>
  );
}
