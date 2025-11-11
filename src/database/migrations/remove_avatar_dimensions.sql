-- Migration: Remove avatar width and height columns
-- These columns are not being properly stored from the frontend and are not needed

ALTER TABLE users 
DROP COLUMN avatar_width,
DROP COLUMN avatar_height;

-- Keep these essential metadata columns:
-- - avatar_mime_type (for Content-Type header)
-- - avatar_size_bytes (for Content-Length header) 
-- - avatar_uploaded_at (for cache control)