import { useState } from 'react';
import './HomeBanner.css';

export default function HomeBanner() {
  const [searchQuery, setSearchQuery] = useState('');

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
          <div className="home-banner-image-placeholder">
            <svg 
              viewBox="0 0 400 400" 
              className="home-banner-svg"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Book stack illustration */}
              <rect x="80" y="180" width="120" height="160" fill="#3b82f6" rx="8"/>
              <rect x="100" y="160" width="120" height="160" fill="#2563eb" rx="8"/>
              <rect x="120" y="140" width="120" height="160" fill="#1d4ed8" rx="8"/>
              
              {/* Book details */}
              <line x1="130" y1="160" x2="230" y2="160" stroke="white" strokeWidth="2"/>
              <line x1="130" y1="180" x2="210" y2="180" stroke="white" strokeWidth="2"/>
              <line x1="130" y1="200" x2="220" y2="200" stroke="white" strokeWidth="2"/>
              
              {/* Decorative elements */}
              <circle cx="300" cy="100" r="40" fill="#fbbf24" opacity="0.3"/>
              <circle cx="320" cy="300" r="30" fill="#f59e0b" opacity="0.3"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
