-- Add Email and Address to Users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(150);
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;

-- Create unique index on email if not already there, but keeping it optional for now
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
