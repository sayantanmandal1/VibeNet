-- Migration: Add additional user profile fields
-- Date: 2026-01-04

-- Add new columns to users table (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'country') THEN
        ALTER TABLE users ADD COLUMN country VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'date_of_birth') THEN
        ALTER TABLE users ADD COLUMN date_of_birth DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'gender') THEN
        ALTER TABLE users ADD COLUMN gender VARCHAR(20);
    END IF;
END $$;

-- Add indexes for the new fields (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_users_country ON users(country);
CREATE INDEX IF NOT EXISTS idx_users_date_of_birth ON users(date_of_birth);
CREATE INDEX IF NOT EXISTS idx_users_gender ON users(gender);

-- Add check constraint for gender values (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'check_gender' AND table_name = 'users') THEN
        ALTER TABLE users 
        ADD CONSTRAINT check_gender 
        CHECK (gender IN ('male', 'female', 'non-binary', 'prefer-not-to-say', 'other') OR gender IS NULL);
    END IF;
END $$;

-- Add check constraint for date of birth (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'check_age' AND table_name = 'users') THEN
        ALTER TABLE users 
        ADD CONSTRAINT check_age 
        CHECK (date_of_birth IS NULL OR date_of_birth <= CURRENT_DATE - INTERVAL '13 years');
    END IF;
END $$;