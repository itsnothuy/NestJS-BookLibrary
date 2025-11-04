ALTER TABLE users 
ADD COLUMN avatar_filename VARCHAR(255) NULL,
ADD COLUMN avatar_path VARCHAR(500) NULL,
ADD COLUMN avatar_url VARCHAR(500) NULL,
ADD COLUMN avatar_mime_type VARCHAR(100) NULL,
ADD COLUMN avatar_size_bytes INT NULL,
ADD COLUMN avatar_width INT NULL,
ADD COLUMN avatar_height INT NULL,
ADD COLUMN avatar_uploaded_at DATETIME(6) NULL;