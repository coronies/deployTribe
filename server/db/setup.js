const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  // First connect to postgres database to create our database
  const postgresPool = new Pool({
    user: 'postgres',
    host: 'localhost',
    password: 'postgres',
    port: 5432,
    database: 'postgres'
  });

  try {
    // Check if database exists
    const result = await postgresPool.query(
      "SELECT 1 FROM pg_database WHERE datname = 'edtech'"
    );

    // Create database if it doesn't exist
    if (result.rows.length === 0) {
      console.log('Creating database...');
      await postgresPool.query('CREATE DATABASE edtech');
      console.log('Database created successfully!');
    }
  } catch (error) {
    console.error('Error creating database:', error);
    throw error;
  } finally {
    await postgresPool.end();
  }

  // Connect to edtech database
  const edtechPool = new Pool({
    user: 'postgres',
    host: 'localhost',
    password: 'postgres',
    port: 5432,
    database: 'edtech'
  });

  try {
    // Read and execute schema.sql
    console.log('Creating tables...');
    const schemaSQL = await fs.readFile(path.join(__dirname, 'schema.sql'), 'utf8');
    await edtechPool.query(schemaSQL);
    console.log('Tables created successfully!');

    // Read and execute seed.sql
    console.log('Inserting sample data...');
    const seedSQL = await fs.readFile(path.join(__dirname, 'seed.sql'), 'utf8');
    await edtechPool.query(seedSQL);
    console.log('Sample data inserted successfully!');

    console.log('Database setup completed!');
  } catch (error) {
    console.error('Error setting up database:', error);
    throw error;
  } finally {
    await edtechPool.end();
  }
}

setupDatabase().catch(error => {
  console.error('Setup failed:', error);
  process.exit(1);
}); 