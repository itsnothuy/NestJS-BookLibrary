import Header from '../layout/Header';
import NavTab from '../layout/NavTab';
import StudentBooksGallery from './StudentBooksGallery';

export default function StudentBooksPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Header />
      <NavTab activeTab="books" setActiveTab={() => {}} />
      <main style={{ padding: '20px' }}>
        <StudentBooksGallery />
      </main>
    </div>
  );
}
