import { Outlet } from 'react-router-dom';
import NavTab from '../../components/layout/NavTab';
import Header from '../../components/layout/Header';
import './Dashboard.css';

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export default function Dashboard() {
  return (
    <div className="dashboard-container">
      {/* Header */}
      <Header />
      {/* Navigation Tabs */}
      <NavTab />
      {/* Breadcrumbs */}
      {/* <Breadcrumbs /> */}
      {/* Main Content */}
      <main className="dashboard-main">
        {/* Render child routes (index, books, users, borrowings) */}
        <Outlet />
      </main>
    </div>
  );
}
