-- Migration to drop avatar_mime_type and avatar_size_bytes columns from users table

ALTER TABLE users
  DROP COLUMN avatar_mime_type,
  DROP COLUMN avatar_size_bytes;