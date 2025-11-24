import { Button } from '@heroui/react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards, Autoplay } from 'swiper/modules';
import { useBooks } from '../../modules/books/BooksContext';

// Import Swiper styles - Correct paths for Swiper v12
import 'swiper/css';
import 'swiper/css/effect-cards';

import './BookCarousel.css';

const API_BASE = import.meta.env.VITE_API_BASE;

export default function BookCarousel() {
  // Use featuredBooks from BooksContext (already fetched and cached)
  const { featuredBooks, loading } = useBooks();

  if (loading) {
    return (
      <div className="book-carousel-container">
        <h2 className="book-carousel-title">Featured Books</h2>
        <div className="book-carousel-loading">Loading books...</div>
      </div>
    );
  }

  if (featuredBooks.length === 0) {
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
      
      <div className="swiper-wrapper-container">
        <Swiper
          effect={'cards'}
          grabCursor={true}
          modules={[EffectCards, Autoplay]}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          className="book-swiper"
        >
          {featuredBooks.map((book) => (
            <SwiperSlide key={book.id} className="book-swiper-slide">
              <div className="book-card-content">
                <div className="book-cover">
                  {book.coverImageUrl ? (
                    <img
                      src={`${API_BASE}${book.coverImageUrl}`}
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
                  {book.publishedYear && (
                    <p className="book-card-genre">Published: {book.publishedYear}</p>
                  )}
                  <p className="book-card-availability">
                    <span className="availability-badge available">
                      Available for borrowing
                    </span>
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="book-carousel-view-all">
        <Button as={Link} to="/student/books" color="primary" size="lg">
          View All Books
        </Button>
      </div>
    </div>
  );
}
