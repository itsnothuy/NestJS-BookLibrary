import './FeaturedSection.css';

export default function FeaturedSection() {
  const stats = [
    { value: '800+', label: 'Books Available' },
    { value: '550+', label: 'Active Readers' },
    { value: '1200+', label: 'Books Borrowed' },
  ];

  return (
    <div className="featured-section-container">
      <div className="featured-section-content">
        {/* Stats Section */}
        <div className="stats-section">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Promotional Banner */}
        <div className="promo-banner">
          <div className="promo-content">
            <div className="promo-text">
              <h2 className="promo-title">Your Favorite Book</h2>
              <p className="promo-description">
                Discover a world of knowledge and adventure. Browse our extensive collection
                of books across various genres and find your next favorite read.
              </p>
              <div className="promo-features">
                <div className="feature-item">
                  <span className="feature-icon">📚</span>
                  <span className="feature-text">Extensive Collection</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🔄</span>
                  <span className="feature-text">Easy Borrowing</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">⭐</span>
                  <span className="feature-text">Curated Selections</span>
                </div>
              </div>
            </div>
            <div className="promo-image">
              <svg
                viewBox="0 0 400 300"
                className="promo-svg"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Book stack illustration */}
                <rect x="100" y="150" width="80" height="100" rx="4" fill="#3b82f6" />
                <rect x="100" y="150" width="80" height="10" fill="#2563eb" />
                <rect x="140" y="120" width="80" height="100" rx="4" fill="#8b5cf6" />
                <rect x="140" y="120" width="80" height="10" fill="#7c3aed" />
                <rect x="180" y="140" width="80" height="100" rx="4" fill="#ec4899" />
                <rect x="180" y="140" width="80" height="10" fill="#db2777" />
                
                {/* Decorative stars */}
                <circle cx="280" cy="80" r="3" fill="#fbbf24" />
                <circle cx="300" cy="100" r="2" fill="#fbbf24" />
                <circle cx="320" cy="90" r="2.5" fill="#fbbf24" />
                <circle cx="90" cy="100" r="2" fill="#fbbf24" />
                <circle cx="70" cy="120" r="3" fill="#fbbf24" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
