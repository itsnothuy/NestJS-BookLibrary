import { useState } from 'react';
import Header from '../../components/layout/Header';
import NavTab from '../../components/layout/NavTab';
import HomeBanner from '../../components/home/HomeBanner';
import BookCarousel from '../../components/home/BookCarousel';
import FeaturedSection from '../../components/home/FeaturedSection';
import StudentBooksPage from '../../components/books/StudentBooksPage';
import { MyBorrowings } from '../../components/borrowing/MyBorrowings';
import { BorrowingHistory } from '../../components/borrowing/BorrowingHistory';
import './StudentLayout.css';

export default function StudentLayout() {
  const [activeTab, setActiveTab] = useState<string | null>(null);

  return (
    <div className="student-layout-container">
      {/* Header */}
      <Header />
      
      {/* Navigation Tabs */}
      <NavTab activeTab={activeTab} setActiveTab={(tab: string | null) => setActiveTab(tab)} />
      
      {/* Main Content */}
      <main className="student-layout-main">
        {/* Default home view - shown when no tab is active */}
        {!activeTab && (
          <>
            <HomeBanner />
            <BookCarousel />
            <FeaturedSection />
          </>
        )}
        
        {/* Tab-based content */}
        {activeTab === 'books' && <StudentBooksPage />}
        {activeTab === 'my-borrowings' && <MyBorrowings />}
        {activeTab === 'borrowing-history' && <BorrowingHistory />}
      </main>
    </div>
  );
}
