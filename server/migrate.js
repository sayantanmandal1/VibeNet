const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'vibenet',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Create migrations table if it doesn't exist
async function createMigrationsTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  try {
    await pool.query(query);
    console.log('Migrations table ready');
  } catch (error) {
    console.error('Error creating migrations table:', error);
    throw error;
  }
}

// Get list of applied migrations
async function getAppliedMigrations() {
  try {
    const result = await pool.query('SELECT filename FROM migrations ORDER BY id');
    return result.rows.map(row => row.filename);
  } catch (error) {
    console.error('Error getting applied migrations:', error);
    throw error;
  }
}

// Apply a single migration
async function applyMigration(filename) {
  const migrationPath = path.join(__dirname, '../database/migrations', filename);
  
  if (!fs.existsSync(migrationPath)) {
    throw new Error(`Migration file not found: ${filename}`);
  }
  
  const sql = fs.readFileSync(migrationPath, 'utf8');
  
  try {
    // Start transaction
    await pool.query('BEGIN');
    
    // Execute migration SQL
    await pool.query(sql);
    
    // Record migration as applied
    await pool.query(
      'INSERT INTO migrations (filename) VALUES ($1)',
      [filename]
    );
    
    // Commit transaction
    await pool.query('COMMIT');
    
    console.log(`✓ Applied migration: ${filename}`);
  } catch (error) {
    // Rollback on error
    await pool.query('ROLLBACK');
    console.error(`✗ Failed to apply migration: ${filename}`);
    throw error;
  }
}

// Run all pending migrations
async function runMigrations() {
  try {
    await createMigrationsTable();
    
    const appliedMigrations = await getAppliedMigrations();
    const migrationFiles = fs.readdirSync(path.join(__dirname, '../database/migrations'))
      .filter(file => file.endsWith('.sql') && !file.includes('rollback'))
      .sort();
    
    const pendingMigrations = migrationFiles.filter(
      file => !appliedMigrations.includes(file)
    );
    
    if (pendingMigrations.length === 0) {
      console.log('No pending migrations');
      return;
    }
    
    console.log(`Found ${pendingMigrations.length} pending migration(s)`);
    
    for (const migration of pendingMigrations) {
      await applyMigration(migration);
    }
    
    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migrations if this script is executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations, pool };