const { Pool } = require('pg');

// Create connection pool - works with any PostgreSQL database (including Prisma-hosted)
// Uses POSTGRES_PRISMA_URL if available (pooled connection), otherwise POSTGRES_URL
const connectionString = process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('No database connection string found. Please set POSTGRES_PRISMA_URL, POSTGRES_URL, or DATABASE_URL');
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: connectionString && connectionString.includes('sslmode=require') ? { rejectUnauthorized: false } : false,
  // Connection pool settings for serverless
  max: 1, // Limit connections for serverless
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Initialize database tables
async function init() {
  const client = await pool.connect();
  try {
    // Activities table - stores Strava activities
    await client.query(`
      CREATE TABLE IF NOT EXISTS activities (
        id SERIAL PRIMARY KEY,
        strava_id INTEGER UNIQUE NOT NULL,
        name TEXT,
        distance REAL,
        moving_time INTEGER,
        elapsed_time INTEGER,
        start_date TEXT,
        activity_type TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Bikes table - stores user's bicycles
    await client.query(`
      CREATE TABLE IF NOT EXISTS bikes (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Components table - stores components on each bike
    await client.query(`
      CREATE TABLE IF NOT EXISTS components (
        id SERIAL PRIMARY KEY,
        bike_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        component_type TEXT NOT NULL,
        install_date TEXT,
        install_distance REAL DEFAULT 0,
        service_interval_miles REAL,
        service_interval_time INTEGER,
        notes TEXT,
        FOREIGN KEY (bike_id) REFERENCES bikes (id) ON DELETE CASCADE
      )
    `);

    // Component usage table - links activities to components
    await client.query(`
      CREATE TABLE IF NOT EXISTS component_usage (
        id SERIAL PRIMARY KEY,
        component_id INTEGER NOT NULL,
        activity_id INTEGER NOT NULL,
        bike_id INTEGER NOT NULL,
        FOREIGN KEY (component_id) REFERENCES components (id) ON DELETE CASCADE,
        FOREIGN KEY (activity_id) REFERENCES activities (id) ON DELETE CASCADE,
        FOREIGN KEY (bike_id) REFERENCES bikes (id) ON DELETE CASCADE
      )
    `);

    // Strava tokens table
    await client.query(`
      CREATE TABLE IF NOT EXISTS strava_tokens (
        id SERIAL PRIMARY KEY,
        access_token TEXT NOT NULL,
        refresh_token TEXT,
        expires_at INTEGER,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Component replacements table - tracks when components were replaced
    await client.query(`
      CREATE TABLE IF NOT EXISTS component_replacements (
        id SERIAL PRIMARY KEY,
        category TEXT NOT NULL,
        replacement_date TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database tables initialized successfully');
  } catch (error) {
    // If tables already exist, that's fine - ignore the error
    if (error.code === '42P07' || (error.message && error.message.includes('already exists'))) {
      console.log('Database tables already exist');
    } else {
      console.error('Error initializing database:', error);
      throw error;
    }
  } finally {
    client.release();
  }
}

// Helper function to convert ? placeholders to $1, $2, $3 format (pg package requirement)
function convertPlaceholders(sqlString, params) {
  if (params.length === 0) {
    return sqlString;
  }
  
  let converted = sqlString;
  let paramIndex = 1;
  
  for (let i = 0; i < params.length; i++) {
    converted = converted.replace('?', `$${paramIndex}`);
    paramIndex++;
  }
  
  return converted;
}

// Query function - returns all rows
async function query(sqlString, params = []) {
  const client = await pool.connect();
  try {
    const convertedSql = convertPlaceholders(sqlString, params);
    const result = await client.query(convertedSql, params);
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    console.error('SQL:', sqlString);
    console.error('Params:', params);
    throw error;
  } finally {
    client.release();
  }
}

// Run function - for INSERT, UPDATE, DELETE (returns lastID and changes)
async function run(sqlString, params = []) {
  const client = await pool.connect();
  try {
    // For INSERT statements, add RETURNING id to get the inserted ID
    let modifiedSql = sqlString;
    let shouldGetId = false;
    
    if (sqlString.trim().toUpperCase().startsWith('INSERT')) {
      shouldGetId = true;
      if (!sqlString.toUpperCase().includes('RETURNING')) {
        modifiedSql = sqlString.replace(/;?\s*$/, '') + ' RETURNING id';
      }
    }
    
    const convertedSql = convertPlaceholders(modifiedSql, params);
    const result = await client.query(convertedSql, params);
    const rows = result.rows || [];
    
    if (shouldGetId && rows.length > 0) {
      return {
        id: rows[0].id,
        changes: result.rowCount || rows.length
      };
    }
    
    return {
      id: null,
      changes: result.rowCount || rows.length
    };
  } catch (error) {
    console.error('Database run error:', error);
    console.error('SQL:', sqlString);
    console.error('Params:', params);
    throw error;
  } finally {
    client.release();
  }
}

// Get function - returns single row
async function get(sqlString, params = []) {
  const client = await pool.connect();
  try {
    const convertedSql = convertPlaceholders(sqlString, params);
    const result = await client.query(convertedSql, params);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Database get error:', error);
    console.error('SQL:', sqlString);
    console.error('Params:', params);
    throw error;
  } finally {
    client.release();
  }
}

// GetDb function - not needed for pg, but kept for compatibility
function getDb() {
  return pool;
}

module.exports = {
  init,
  query,
  run,
  get,
  getDb
};
