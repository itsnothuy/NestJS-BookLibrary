-- Pagination Performance Indexes

-- Users table indexes
CREATE INDEX idx_users_created_at ON users(createdAt);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_role_created_at ON users(role, createdAt);

-- Books table indexes  
CREATE INDEX idx_books_created_at ON book(createdAt);
CREATE INDEX idx_books_title ON book(title);
CREATE INDEX idx_books_author ON book(author);
CREATE INDEX idx_books_published_year ON book(publishedYear);
CREATE INDEX idx_books_author_published_year ON book(author, publishedYear);

-- Compound indexes for common sorting patterns
CREATE INDEX idx_users_email_created_at ON users(email, createdAt);
CREATE INDEX idx_books_title_created_at ON book(title, createdAt);
CREATE INDEX idx_books_author_created_at ON book(author, createdAt);