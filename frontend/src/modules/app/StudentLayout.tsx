import { Outlet } from 'react-router-dom';
import Header from '../../components/layout/Header';
import NavTab from '../../components/layout/NavTab';
import './StudentLayout.css';

export default function StudentLayout() {
  return (
    <div className="student-layout-container">
      {/* Header */}
      <Header />
      
      {/* Navigation Tabs */}
      <NavTab />
      
      {/* Main Content - renders the matched child route */}
      <main className="student-layout-main">
        <Outlet />
      </main>
    </div>
  );
}
