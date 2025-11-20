import Header from '../../components/layout/Header';
import NavTab from '../../components/layout/NavTab';
import HomeBanner from '../../components/home/HomeBanner';
import BookCarousel from '../../components/home/BookCarousel';
import FeaturedSection from '../../components/home/FeaturedSection';
import './StudentDashboard.css';
import { useState } from 'react';

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState<string | null>(null);

  return (
    <div className="student-dashboard-container">
      {/* Header */}
      <Header />
      
      {/* Navigation Tabs */}
      <NavTab activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main Content */}
      <main className="student-dashboard-main">
        <HomeBanner />
        <BookCarousel />
        <FeaturedSection />
      </main>
    </div>
  );
}
