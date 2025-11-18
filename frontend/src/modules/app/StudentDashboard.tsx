import Header from '../../components/layout/Header';
import StudentBooksGallery from '../../components/books/StudentBooksGallery';
import './StudentDashboard.css';

export default function StudentDashboard() {
  return (
    <div className="student-dashboard-container">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main className="student-dashboard-main">
        <StudentBooksGallery />
      </main>
    </div>
  );
}
