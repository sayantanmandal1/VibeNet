const fs = require('fs');
const path = require('path');
const pool = require('./config/database');

async function runMigration() {
  try {
    console.log('Running migration: Add user profile fields...');
    
    const migrationPath = path.join(__dirname, '../database/migrations/002_add_user_profile_fields.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    await pool.query(migrationSQL);
    
    console.log('Migration completed successfully!');
    console.log('Added fields: country, date_of_birth, gender to users table');
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();