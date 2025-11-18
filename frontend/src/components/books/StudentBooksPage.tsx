import Header from '../layout/Header';
import StudentBooksGallery from './StudentBooksGallery';

export default function StudentBooksPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Header />
      <main style={{ padding: '20px' }}>
        <StudentBooksGallery />
      </main>
    </div>
  );
}
