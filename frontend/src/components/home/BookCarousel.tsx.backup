import { useEffect, useState } from 'react';
import { Button } from '@heroui/react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCards, Autoplay } from 'swiper/modules';

// Import Swiper styles - Correct paths for Swiper v12
import 'swiper/css';
import 'swiper/css/effect-cards';

import './BookCarousel.css';

const API_BASE = import.meta.env.VITE_API_BASE;

interface Book {
  id: string; // This is the UUID from backend
  title: string;
  author: string;
  isbn: string;
  publishedYear: number | null;
  coverImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export default function BookCarousel() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const abortController = new AbortController();
    
    const fetchFeaturedBooks = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/books?limit=8&sortBy=availableCopies&sortOrder=desc`,
          { signal: abortController.signal }
        );
        const data = await response.json();
        setBooks(data.data || []);
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Error fetching featured books:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedBooks();
    
    return () => {
      abortController.abort();
    };
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
          {books.map((book) => (
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
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="book-carousel-view-all">
        <Button as={Link} to="/books" color="primary" size="lg">
          View All Books
        </Button>
      </div>
    </div>
  );
}
