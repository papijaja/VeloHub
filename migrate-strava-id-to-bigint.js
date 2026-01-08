// Migration script to change strava_id column from INTEGER to BIGINT
// Run this script to fix the "out of range for type integer" error

require('dotenv').config();
const { Pool } = require('pg');

const connectionString = process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('Error: No database connection string found.');
  console.error('Please set POSTGRES_PRISMA_URL, POSTGRES_URL, or DATABASE_URL in your .env file');
  process.exit(1);
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: connectionString && connectionString.includes('sslmode=require') ? { rejectUnauthorized: false } : false,
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Connecting to database...');
    
    // Check if the table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'activities'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('Activities table does not exist yet. Migration not needed.');
      console.log('The table will be created with the correct type on first use.');
      return;
    }
    
    // Check current column type
    const columnInfo = await client.query(`
      SELECT data_type 
      FROM information_schema.columns 
      WHERE table_name = 'activities' 
      AND column_name = 'strava_id';
    `);
    
    if (columnInfo.rows.length === 0) {
      console.log('strava_id column does not exist. Migration not needed.');
      return;
    }
    
    const currentType = columnInfo.rows[0].data_type;
    console.log(`Current strava_id column type: ${currentType}`);
    
    if (currentType === 'bigint') {
      console.log('Column is already BIGINT. No migration needed!');
      return;
    }
    
    console.log('Altering strava_id column from INTEGER to BIGINT...');
    
    // Run the migration
    await client.query('BEGIN');
    
    try {
      await client.query('ALTER TABLE activities ALTER COLUMN strava_id TYPE BIGINT');
      await client.query('COMMIT');
      
      console.log('✅ Migration successful! strava_id column is now BIGINT.');
      console.log('You can now sync Strava activities without errors.');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
    
  } catch (error) {
    console.error('❌ Migration failed:');
    console.error(error.message);
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
migrate()
  .then(() => {
    console.log('\nMigration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nMigration failed:', error);
    process.exit(1);
  });
