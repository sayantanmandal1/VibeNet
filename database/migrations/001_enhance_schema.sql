-- Migration 001: Enhance schema for social media platform
-- This migration adds username support, enhances friend request tracking,
-- and adds performance indexes

-- Add new columns to users table
ALTER TABLE users 
ADD COLUMN username VARCHAR(50) UNIQUE,
ADD COLUMN phone_number VARCHAR(20),
ADD COLUMN default_username_hash VARCHAR(255);

-- Create index for username lookups
CREATE INDEX idx_users_username ON users(username);

-- Enhance friends table with proper request tracking
ALTER TABLE friends 
ADD COLUMN requested_by UUID REFERENCES users(id),
ADD COLUMN requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN accepted_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for friend request performance
CREATE INDEX idx_friends_requested_by ON friends(requested_by);
CREATE INDEX idx_friends_status ON friends(status);
CREATE INDEX idx_friends_requested_at ON friends(requested_at DESC);

-- Create composite indexes for common queries
CREATE INDEX idx_friends_user_status ON friends(user_id, status);
CREATE INDEX idx_friends_friend_status ON friends(friend_id, status);

-- Add performance indexes for user discovery
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_users_name ON users(name);

-- Function to generate default username hash
CREATE OR REPLACE FUNCTION generate_default_username_hash(user_id UUID, user_name TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Generate a hash based on user ID and name for uniqueness
    RETURN 'user_' || SUBSTRING(MD5(user_id::TEXT || user_name || EXTRACT(EPOCH FROM NOW())::TEXT), 1, 8);
END;
$$ LANGUAGE plpgsql;

-- Update existing users with default username hashes
UPDATE users 
SET default_username_hash = generate_default_username_hash(id, name)
WHERE default_username_hash IS NULL;

-- Make default_username_hash NOT NULL after populating existing data
ALTER TABLE users ALTER COLUMN default_username_hash SET NOT NULL;

-- Create unique index for default username hash
CREATE UNIQUE INDEX idx_users_default_username_hash ON users(default_username_hash);

-- Update existing friend records to have proper tracking
-- Set requested_by to user_id for existing pending requests
UPDATE friends 
SET requested_by = user_id,
    requested_at = created_at
WHERE requested_by IS NULL AND status = 'pending';

-- Set requested_by and accepted_at for existing accepted friendships
UPDATE friends 
SET requested_by = user_id,
    requested_at = created_at,
    accepted_at = created_at
WHERE requested_by IS NULL AND status = 'accepted';

-- Add constraint to ensure requested_by is always set for new records
ALTER TABLE friends ALTER COLUMN requested_by SET NOT NULL;