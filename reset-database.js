const db = require('./db/database');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'db', 'bike_mechanic.db');

async function resetDatabase() {
  return new Promise((resolve, reject) => {
    const database = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }
    });

    database.serialize(() => {
      console.log('Resetting database...');
      
      // Delete all data from tables (in order to respect foreign keys)
      database.run('DELETE FROM component_usage', (err) => {
        if (err) console.error('Error clearing component_usage:', err);
      });
      
      database.run('DELETE FROM activities', (err) => {
        if (err) console.error('Error clearing activities:', err);
      });
      
      database.run('DELETE FROM components', (err) => {
        if (err) console.error('Error clearing components:', err);
      });
      
      database.run('DELETE FROM bikes', (err) => {
        if (err) console.error('Error clearing bikes:', err);
      });
      
      database.run('DELETE FROM strava_tokens', (err) => {
        if (err) console.error('Error clearing strava_tokens:', err);
      });
      
      database.run('DELETE FROM component_replacements', (err) => {
        if (err) {
          console.error('Error clearing component_replacements:', err);
          reject(err);
          return;
        }
        console.log('Database reset complete!');
        console.log('All data has been cleared:');
        console.log('  - Strava connection removed');
        console.log('  - All activities deleted');
        console.log('  - All replacement history cleared');
        console.log('  - All bikes and components removed');
        database.close((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
  });
}

resetDatabase()
  .then(() => {
    console.log('\nDatabase reset successful! You can restart your server now.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error resetting database:', err);
    process.exit(1);
  });
