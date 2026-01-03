-- Rollback Migration 001: Remove schema enhancements
-- This script reverses the changes made in 001_enhance_schema.sql

-- Drop indexes first
DROP INDEX IF EXISTS idx_users_username;
DROP INDEX IF EXISTS idx_friends_requested_by;
DROP INDEX IF EXISTS idx_friends_status;
DROP INDEX IF EXISTS idx_friends_requested_at;
DROP INDEX IF EXISTS idx_friends_user_status;
DROP INDEX IF EXISTS idx_friends_friend_status;
DROP INDEX IF EXISTS idx_users_created_at;
DROP INDEX IF EXISTS idx_users_name;
DROP INDEX IF EXISTS idx_users_default_username_hash;

-- Drop the function
DROP FUNCTION IF EXISTS generate_default_username_hash(UUID, TEXT);

-- Remove columns from friends table
ALTER TABLE friends 
DROP COLUMN IF EXISTS requested_by,
DROP COLUMN IF EXISTS requested_at,
DROP COLUMN IF EXISTS accepted_at;

-- Remove columns from users table
ALTER TABLE users 
DROP COLUMN IF EXISTS username,
DROP COLUMN IF EXISTS phone_number,
DROP COLUMN IF EXISTS default_username_hash;