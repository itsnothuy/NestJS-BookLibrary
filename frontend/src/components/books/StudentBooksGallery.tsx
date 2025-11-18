import { useState, useEffect } from 'react';
import { Card, CardBody, CardFooter, Image } from '@heroui/react';
import './StudentBooksGallery.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publishedYear: number | null;
  coverImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export default function StudentBooksGallery() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/books`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setBooks(data);
    } catch (err) {
      console.error('Error fetching books:', err);
      setError('Failed to load books. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = (book: Book) => {
    console.log('Book clicked:', book);
    // TODO: Navigate to book detail page or show modal
  };

  const getBookCoverUrl = (book: Book) => {
    if (book.coverImageUrl) {
      return `${API_BASE}${book.coverImageUrl}`;
    }
    // Fallback placeholder image
    return 'https://via.placeholder.com/300x400/e5e7eb/6b7280?text=No+Cover';
  };

  if (loading) {
    return (
      <div className="student-books-container">
        <div className="student-books-loading">Loading books...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-books-container">
        <div className="student-books-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="student-books-container">
      <h2 className="student-books-title">Available Books</h2>
      <div className="student-books-grid">
        {books.map((book) => (
          <Card 
            key={book.id} 
            isPressable 
            shadow="sm" 
            onPress={() => handleBookClick(book)}
            className="student-book-card"
          >
            <CardBody className="student-book-card-body">
              <Image
                alt={book.title}
                className="student-book-cover"
                radius="lg"
                shadow="sm"
                src={getBookCoverUrl(book)}
                width="100%"
              />
            </CardBody>
            <CardFooter className="student-book-card-footer">
              <div className="student-book-info">
                <b className="student-book-title">{book.title}</b>
                <p className="student-book-author">{book.author}</p>
                {book.publishedYear && (
                  <p className="student-book-year">{book.publishedYear}</p>
                )}
              </div>
              <button className="student-book-button">
                Borrow
              </button>
            </CardFooter>
          </Card>
        ))}
      </div>
      {books.length === 0 && !loading && (
        <div className="student-books-empty">
          No books available at the moment.
        </div>
      )}
    </div>
  );
}
