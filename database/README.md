# Database Migrations

This directory contains database schema definitions and migration scripts for the VibeNet social media platform.

## Files

- `init.sql` - Initial database schema with all tables and indexes
- `migrations/` - Directory containing migration files
- `../server/migrate.js` - Migration runner script (located in server directory)

## Migration Files

### 001_enhance_schema.sql
Enhances the database schema with:
- Username support for users (unique usernames for profile URLs)
- Phone number field for users
- Default username hash generation
- Enhanced friend request tracking with proper timestamps
- Performance indexes for common queries

### 001_enhance_schema_rollback.sql
Rollback script to undo the schema enhancements if needed.

## Usage

### Running Migrations
```bash
# From the server directory
npm run migrate

# Or directly with Node.js from server directory
cd server && node migrate.js
```

### Database Initialization (Fresh Install)
```bash
# From the server directory
npm run db:init
```

### Database Reset (Development Only)
```bash
# From the server directory  
npm run db:reset
```

## Migration Process

1. Migrations are applied in alphabetical order by filename
2. Each migration is tracked in the `migrations` table
3. Already applied migrations are skipped
4. All migrations run in transactions for safety
5. Failed migrations are rolled back automatically

## Schema Changes

### Users Table Enhancements
- `username` - Unique username for profile URLs (VARCHAR(50))
- `phone_number` - Optional phone number (VARCHAR(20))
- `default_username_hash` - Generated unique hash for default usernames (VARCHAR(255))

### Friends Table Enhancements
- `requested_by` - UUID of user who initiated the friend request
- `requested_at` - Timestamp when request was sent
- `accepted_at` - Timestamp when request was accepted (NULL for pending)

### New Indexes
- `idx_users_username` - Fast username lookups
- `idx_friends_requested_by` - Friend request queries
- `idx_friends_status` - Status-based queries
- `idx_friends_requested_at` - Chronological request ordering
- `idx_friends_user_status` - Composite index for user + status queries
- `idx_friends_friend_status` - Composite index for friend + status queries
- `idx_users_created_at` - User discovery by join date
- `idx_users_name` - Name-based searches
- `idx_users_default_username_hash` - Unique constraint on default hashes

## Functions

### generate_default_username_hash(user_id, user_name)
Generates a unique default username hash for users who haven't set a custom username.
Format: `user_` + 8-character MD5 hash of user ID, name, and timestamp.