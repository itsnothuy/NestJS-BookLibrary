import Header from '../../components/layout/Header';
import HomeBanner from '../../components/home/HomeBanner';
import BookCarousel from '../../components/home/BookCarousel';
import FeaturedSection from '../../components/home/FeaturedSection';
import './StudentDashboard.css';

export default function StudentDashboard() {
  return (
    <div className="student-dashboard-container">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main className="student-dashboard-main">
        <HomeBanner />
        <BookCarousel />
        <FeaturedSection />
      </main>
    </div>
  );
}
