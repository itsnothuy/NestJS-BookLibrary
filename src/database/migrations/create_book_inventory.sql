-- Migration: Create book_inventory table
-- Date: 2025-11-19
-- Description: Table for tracking book quantities and availability

CREATE TABLE IF NOT EXISTS book_inventory (
    bookId INT PRIMARY KEY,
    totalCopies INT NOT NULL DEFAULT 1,
    availableCopies INT NOT NULL DEFAULT 1,
    
    -- Metadata
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    FOREIGN KEY (bookId) REFERENCES book(id) ON DELETE CASCADE,
    
    -- Ensure data integrity
    CHECK (availableCopies >= 0),
    CHECK (totalCopies >= availableCopies),
    CHECK (totalCopies >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Trigger to automatically create inventory entry when a new book is added
DELIMITER $$
CREATE TRIGGER after_book_insert
AFTER INSERT ON book
FOR EACH ROW
BEGIN
    INSERT INTO book_inventory (bookId, totalCopies, availableCopies)
    VALUES (NEW.id, 1, 1);
END$$
DELIMITER ;
