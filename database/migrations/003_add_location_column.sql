-- Add location column to users table
ALTER TABLE users ADD COLUMN location VARCHAR(100);

-- Add comment for the column
COMMENT ON COLUMN users.location IS 'User location/address information';