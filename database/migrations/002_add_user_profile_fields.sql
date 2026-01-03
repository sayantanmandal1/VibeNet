-- Migration: Add additional user profile fields
-- Date: 2026-01-04

-- Add new columns to users table
ALTER TABLE users 
ADD COLUMN country VARCHAR(100),
ADD COLUMN date_of_birth DATE,
ADD COLUMN gender VARCHAR(20);

-- Add indexes for the new fields
CREATE INDEX idx_users_country ON users(country);
CREATE INDEX idx_users_date_of_birth ON users(date_of_birth);
CREATE INDEX idx_users_gender ON users(gender);

-- Add check constraint for gender values
ALTER TABLE users 
ADD CONSTRAINT check_gender 
CHECK (gender IN ('male', 'female', 'non-binary', 'prefer-not-to-say', 'other') OR gender IS NULL);

-- Add check constraint for date of birth (must be at least 13 years old)
ALTER TABLE users 
ADD CONSTRAINT check_age 
CHECK (date_of_birth IS NULL OR date_of_birth <= CURRENT_DATE - INTERVAL '13 years');