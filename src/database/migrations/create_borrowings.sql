-- Migration: Create borrowings table
-- Date: 2025-11-19
-- Description: Table for tracking active and historical book borrowings

CREATE TABLE IF NOT EXISTS borrowings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    
    -- Foreign Keys
    userId INT NOT NULL,
    bookId INT NOT NULL,
    requestId INT NULL,
    
    -- Borrowing Details
    borrowedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    dueDate DATETIME NOT NULL,
    returnedAt DATETIME NULL,
    
    -- Status
    status ENUM('active', 'returned', 'overdue') NOT NULL DEFAULT 'active',
    
    -- Late Fee Calculation
    daysOverdue INT NOT NULL DEFAULT 0,
    lateFeeAmount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    lateFeePerDay DECIMAL(10, 2) NOT NULL DEFAULT 0.50,
    
    -- Notes
    borrowNotes VARCHAR(500) NULL,
    returnNotes VARCHAR(500) NULL,
    
    -- Metadata
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (bookId) REFERENCES book(id) ON DELETE CASCADE,
    FOREIGN KEY (requestId) REFERENCES borrowing_requests(id) ON DELETE SET NULL,
    
    -- Indexes for performance
    INDEX idx_borrowings_uuid (uuid),
    INDEX idx_borrowings_user (userId),
    INDEX idx_borrowings_book (bookId),
    INDEX idx_borrowings_status (status),
    INDEX idx_borrowings_due_date (dueDate),
    INDEX idx_borrowings_borrowed_at (borrowedAt),
    INDEX idx_borrowings_user_status (userId, status),
    INDEX idx_borrowings_book_status (bookId, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
