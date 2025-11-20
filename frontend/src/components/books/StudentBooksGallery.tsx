import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardBody, CardFooter, Image } from '@heroui/react';
import { BorrowRequestButton } from '../borrowing/BorrowRequestButton';
import './StudentBooksGallery.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
const FALLBACK_IMAGE = 'https://via.placeholder.com/300x400/e5e7eb/6b7280?text=No+Cover';

interface Book {
  id: string;
  uuid: string; // Add uuid for borrowing system
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
  const [loading, setLoading] = useState(true); // Start as true
  const [error, setError] = useState<string | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const fetchBooks = async () => {
      try {
        const response = await fetch(`${API_BASE}/books`, {
          signal: abortController.signal,
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (isMounted) {
          setBooks(data);
          setError(null);
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return; // Ignore abort errors
        }
        console.error('Error fetching books:', err);
        if (isMounted) {
          setError('Failed to load books. Please try again later.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchBooks();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, []); // Empty dependency array - only fetch once on mount

  const handleBookClick = useCallback((book: Book) => {
    setSelectedBook(book);
    setShowViewModal(true);
  }, []);

  const getBookCoverUrl = useCallback((book: Book) => {
    return book.coverImageUrl ? `${API_BASE}${book.coverImageUrl}` : FALLBACK_IMAGE;
  }, []);

  const hasBooks = useMemo(() => books.length > 0, [books.length]);

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
      {hasBooks ? (
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
                  loading="lazy"
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
                <button 
                  className="student-book-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedBook(book);
                    setShowViewModal(true);
                  }}
                >
                  Borrow
                </button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="student-books-empty">
          No books available at the moment.
        </div>
      )}

      {/* View Book Modal with Borrow Form */}
      {showViewModal && selectedBook && (
        <div className="paginated-books-modal" onClick={() => setShowViewModal(false)}>
          <div className="paginated-books-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Book Details</h2>
            
            {/* Book Cover */}
            {selectedBook.coverImageUrl && (
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <img 
                  src={getBookCoverUrl(selectedBook)} 
                  alt={selectedBook.title}
                  style={{ maxWidth: '200px', borderRadius: '8px' }}
                />
              </div>
            )}
            
            <div className="paginated-books-form-group">
              <strong>Title:</strong> {selectedBook.title}
            </div>
            <div className="paginated-books-form-group">
              <strong>Author:</strong> {selectedBook.author}
            </div>
            <div className="paginated-books-form-group">
              <strong>ISBN:</strong> {selectedBook.isbn}
            </div>
            <div className="paginated-books-form-group">
              <strong>Published Year:</strong> {selectedBook.publishedYear || "Unknown"}
            </div>
            
            {/* Borrow Request Section */}
            <div className="paginated-books-form-group" style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '1.1rem' }}>Borrow This Book</h3>
              <BorrowRequestButton 
                bookUuid={selectedBook.uuid} 
                bookTitle={selectedBook.title}
              />
            </div>
            
            <div className="paginated-books-modal-buttons">
              <button
                className="paginated-books-button"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
