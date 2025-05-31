const fs = require('fs').promises;
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.REACT_APP_DB_USER || 'postgres',
  host: process.env.REACT_APP_DB_HOST || 'localhost',
  database: process.env.REACT_APP_DB_NAME || 'edtech',
  password: process.env.REACT_APP_DB_PASSWORD || 'postgres',
  port: process.env.REACT_APP_DB_PORT || 5432,
});

async function runMigrations() {
  try {
    // Create migrations table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get list of migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = await fs.readdir(migrationsDir);
    const migrationFiles = files.filter(f => f.endsWith('.sql')).sort();

    // Get executed migrations
    const { rows: executedMigrations } = await pool.query('SELECT name FROM migrations');
    const executedMigrationNames = executedMigrations.map(m => m.name);

    // Run pending migrations
    for (const file of migrationFiles) {
      if (!executedMigrationNames.includes(file)) {
        console.log(`Running migration: ${file}`);
        const filePath = path.join(migrationsDir, file);
        const sql = await fs.readFile(filePath, 'utf8');

        await pool.query('BEGIN');
        try {
          await pool.query(sql);
          await pool.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
          await pool.query('COMMIT');
          console.log(`Migration ${file} completed successfully`);
        } catch (error) {
          await pool.query('ROLLBACK');
          console.error(`Error running migration ${file}:`, error);
          throw error;
        }
      }
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations(); 