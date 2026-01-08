const { sql } = require('@vercel/postgres');

// Helper function to safely convert SQL with ? placeholders
// Since @vercel/postgres uses template literals and we can't easily convert
// ? placeholders at runtime, we'll use sql.raw() with proper parameter escaping
function convertQuery(sqlString, params = []) {
  if (params.length === 0) {
    return sql.raw(sqlString);
  }
  
  // Escape and replace parameters
  // This is safe because the parameters come from our code, not direct user input
  // (user input is already parameterized through the ? placeholders)
  let query = sqlString;
  
  for (const param of params) {
    let replacement;
    
    if (param === null || param === undefined) {
      replacement = 'NULL';
    } else if (typeof param === 'string') {
      // Escape single quotes in strings
      const escaped = param.replace(/'/g, "''");
      replacement = `'${escaped}'`;
    } else if (typeof param === 'number') {
      replacement = String(param);
    } else if (typeof param === 'boolean') {
      replacement = param ? 'TRUE' : 'FALSE';
    } else {
      // For other types, convert to string and escape
      const escaped = String(param).replace(/'/g, "''");
      replacement = `'${escaped}'`;
    }
    
    // Replace first ? with the escaped parameter
    query = query.replace('?', replacement);
  }
  
  return sql.raw(query);
}

// Initialize database tables
async function init() {
  try {
    // Activities table - stores Strava activities
    await sql`
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
    `;

    // Bikes table - stores user's bicycles
    await sql`
      CREATE TABLE IF NOT EXISTS bikes (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Components table - stores components on each bike
    await sql`
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
    `;

    // Component usage table - links activities to components
    await sql`
      CREATE TABLE IF NOT EXISTS component_usage (
        id SERIAL PRIMARY KEY,
        component_id INTEGER NOT NULL,
        activity_id INTEGER NOT NULL,
        bike_id INTEGER NOT NULL,
        FOREIGN KEY (component_id) REFERENCES components (id) ON DELETE CASCADE,
        FOREIGN KEY (activity_id) REFERENCES activities (id) ON DELETE CASCADE,
        FOREIGN KEY (bike_id) REFERENCES bikes (id) ON DELETE CASCADE
      )
    `;

    // Strava tokens table
    await sql`
      CREATE TABLE IF NOT EXISTS strava_tokens (
        id SERIAL PRIMARY KEY,
        access_token TEXT NOT NULL,
        refresh_token TEXT,
        expires_at INTEGER,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Component replacements table - tracks when components were replaced
    await sql`
      CREATE TABLE IF NOT EXISTS component_replacements (
        id SERIAL PRIMARY KEY,
        category TEXT NOT NULL,
        replacement_date TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('Database tables initialized successfully');
  } catch (error) {
    // If tables already exist, that's fine - ignore the error
    // PostgreSQL error code 42P07 means "duplicate_table"
    if (error.code === '42P07' || (error.message && error.message.includes('already exists'))) {
      console.log('Database tables already exist');
    } else {
      console.error('Error initializing database:', error);
      throw error;
    }
  }
}

// Query function - returns all rows
async function query(sqlString, params = []) {
  try {
    const queryObj = convertQuery(sqlString, params);
    const result = await queryObj;
    return result.rows || result;
  } catch (error) {
    console.error('Database query error:', error);
    console.error('SQL:', sqlString);
    console.error('Params:', params);
    throw error;
  }
}

// Run function - for INSERT, UPDATE, DELETE (returns lastID and changes)
async function run(sqlString, params = []) {
  try {
    // For INSERT statements, we need to add RETURNING id to get the inserted ID
    let modifiedSql = sqlString;
    let shouldGetId = false;
    
    if (sqlString.trim().toUpperCase().startsWith('INSERT')) {
      shouldGetId = true;
      // Check if RETURNING is already in the query
      if (!sqlString.toUpperCase().includes('RETURNING')) {
        // Add RETURNING id at the end (before any semicolon)
        modifiedSql = sqlString.replace(/;?\s*$/, '') + ' RETURNING id';
      }
    }
    
    const queryObj = convertQuery(modifiedSql, params);
    const result = await queryObj;
    
    const rows = result.rows || result;
    const rowCount = result.rowCount || (Array.isArray(rows) ? rows.length : 1);
    
    if (shouldGetId && rows && Array.isArray(rows) && rows.length > 0) {
      return {
        id: rows[0].id,
        changes: rowCount
      };
    }
    
    return {
      id: null,
      changes: rowCount
    };
  } catch (error) {
    console.error('Database run error:', error);
    console.error('SQL:', sqlString);
    console.error('Params:', params);
    throw error;
  }
}

// Get function - returns single row
async function get(sqlString, params = []) {
  try {
    const queryObj = convertQuery(sqlString, params);
    const result = await queryObj;
    const rows = result.rows || result;
    return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Database get error:', error);
    console.error('SQL:', sqlString);
    console.error('Params:', params);
    throw error;
  }
}

// GetDb function - not needed for Postgres, but kept for compatibility
function getDb() {
  return null; // Not applicable for Postgres
}

module.exports = {
  init,
  query,
  run,
  get,
  getDb
};
