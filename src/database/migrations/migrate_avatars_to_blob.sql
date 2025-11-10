-- Migration: Convert avatar storage from filesystem to database BLOB
-- This migration adds BLOB storage for avatars and removes filesystem-related columns

-- Add new BLOB column for storing avatar image data (if it doesn't exist)
-- ALTER TABLE users 
-- ADD COLUMN avatar_data LONGBLOB COMMENT 'Avatar image data stored as BLOB';

-- Remove filesystem-related columns (keeping metadata columns)
ALTER TABLE users 
DROP COLUMN avatar_path,
DROP COLUMN avatar_filename, 
DROP COLUMN avatar_url;

-- Keep these metadata columns:
-- - avatar_mime_type (for Content-Type header)
-- - avatar_size_bytes (for Content-Length header) 
-- - avatar_width (for image dimensions)
-- - avatar_height (for image dimensions)
-- - avatar_uploaded_at (for cache control)