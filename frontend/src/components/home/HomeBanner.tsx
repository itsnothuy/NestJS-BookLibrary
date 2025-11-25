import { useState, useEffect } from 'react';
import './HomeBanner.css';
import { useBooks } from '../../modules/books/BooksContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectCards } from 'swiper/modules';

const API_BASE = import.meta.env.VITE_API_BASE;

export default function HomeBanner() {
  const [searchQuery, setSearchQuery] = useState('');
  const { books, fetchFeaturedBooks } = useBooks();
  
  useEffect(() => {
    fetchFeaturedBooks();
  }, [fetchFeaturedBooks]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Implement search navigation
      console.log('Searching for:', searchQuery);
    }
  };

  return (
    <div className="home-banner-container">
      <div className="home-banner-content">
        {/* Left side - Text and Search */}
        <div className="home-banner-text">
          <h1 className="home-banner-title">
            A place for students to Borrow and Return
            <span className="home-banner-title-accent"> for the best Experience</span>
          </h1>
          
          <p className="home-banner-description">
            Discover thousands of books available for borrowing. 
            Find your next favorite read from our extensive collection of 
            academic texts, novels, and reference materials.
          </p>
          
          <form onSubmit={handleSearch} className="home-banner-search">
            <input
              type="search"
              placeholder="Search for a book..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="home-banner-search-input"
            />
            <button type="submit" className="home-banner-search-button">
              Search
            </button>
          </form>
        </div>

        {/* Right side - Image/Illustration */}
        <div className="home-banner-image">
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
      </div>
    </div>
  );
}
