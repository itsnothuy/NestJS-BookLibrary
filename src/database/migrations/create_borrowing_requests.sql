-- Migration: Create borrowing_requests table
-- Date: 2025-11-19
-- Description: Table for tracking student requests to borrow books

CREATE TABLE IF NOT EXISTS borrowing_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE DEFAULT (UUID()),
    
    -- Foreign Keys
    userId INT NOT NULL,
    bookId INT NOT NULL,
    
    -- Request Details
    status ENUM('pending', 'approved', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending',
    requestedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    requestedDays INT NOT NULL DEFAULT 14,
    
    -- Admin Response
    processedBy INT NULL,
    processedAt DATETIME NULL,
    rejectionReason VARCHAR(500) NULL,
    
    -- Metadata
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (bookId) REFERENCES book(id) ON DELETE CASCADE,
    FOREIGN KEY (processedBy) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes for performance
    INDEX idx_borrowing_requests_uuid (uuid),
    INDEX idx_borrowing_requests_user (userId),
    INDEX idx_borrowing_requests_book (bookId),
    INDEX idx_borrowing_requests_status (status),
    INDEX idx_borrowing_requests_requested_at (requestedAt),
    INDEX idx_borrowing_requests_user_book (userId, bookId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
