import { useEffect, useState, useCallback } from 'react';
import { Button } from '@heroui/react';
import { Link } from 'react-router-dom';
import { useBooks } from '../../modules/books/BooksContext';
import type { Book } from '../../types';
import './BookCarousel.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
const FALLBACK_IMAGE = 'https://via.placeholder.com/300x400/e5e7eb/6b7280?text=No+Cover';

export default function BookCarousel() {
  const { books, loading, fetchFeaturedBooks } = useBooks();
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  useEffect(() => {
    fetchFeaturedBooks();
  }, [fetchFeaturedBooks]);

  const handleBookClick = useCallback((book: Book) => {
    setSelectedBook(book);
    setShowViewModal(true);
  }, []);

  const getBookCoverUrl = useCallback((book: Book) => {
    return book.coverImageUrl ? `${API_BASE}${book.coverImageUrl}` : FALLBACK_IMAGE;
  }, []);

  if (loading) {
    return (
      <div className="book-carousel-container">
        <h2 className="book-carousel-title">Featured Books</h2>
        <div className="book-carousel-loading">Loading books...</div>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="book-carousel-container">
        <h2 className="book-carousel-title">Featured Books</h2>
        <div className="book-carousel-empty">No books available at the moment.</div>
      </div>
    );
  }

  return (
    <div className="book-carousel-container">
      <h2 className="book-carousel-title">Featured Books</h2>
      
      <div className="book-carousel-grid">
        {books.slice(0, 8).map((book) => (
          <div 
            key={book.id} 
            className="featured-book-card"
            onClick={() => handleBookClick(book)}
          >
            <div className="book-card-content">
              <div className="book-cover">
                {book.coverImageUrl ? (
                  <img
                    src={getBookCoverUrl(book)}
                    alt={book.title}
                    className="book-cover-image"
                  />
                ) : (
                  <div className="book-cover-placeholder">
                    <span className="book-cover-icon">📚</span>
                  </div>
                )}
              </div>
              <div className="book-details">
                <h3 className="book-card-title">{book.title}</h3>
                <p className="book-card-author">{book.author}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="book-carousel-view-all">
        <Button as={Link} to="/books" color="primary" size="lg">
          View All Books
        </Button>
      </div>

      {/* View Book Modal */}
      {showViewModal && selectedBook && (
        <div className="book-modal" onClick={() => setShowViewModal(false)}>
          <div className="book-modal-content" onClick={(e) => e.stopPropagation()}>
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
            
            <div className="book-modal-info">
              <strong>Title:</strong> {selectedBook.title}
            </div>
            <div className="book-modal-info">
              <strong>Author:</strong> {selectedBook.author}
            </div>
            <div className="book-modal-info">
              <strong>ISBN:</strong> {selectedBook.isbn}
            </div>
            <div className="book-modal-info">
              <strong>Published Year:</strong> {selectedBook.publishedYear || "Unknown"}
            </div>
            
            <div className="book-modal-buttons">
              <button
                className="book-modal-close-button"
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
