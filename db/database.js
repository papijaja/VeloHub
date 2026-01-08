const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'bike_mechanic.db');

let db = null;

function getDb() {
  if (!db) {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      }
    });
  }
  return db;
}

function init() {
  return new Promise((resolve, reject) => {
    const database = getDb();
    
    database.serialize(() => {
      // Activities table - stores Strava activities
      database.run(`
        CREATE TABLE IF NOT EXISTS activities (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          strava_id INTEGER UNIQUE NOT NULL,
          name TEXT,
          distance REAL,
          moving_time INTEGER,
          elapsed_time INTEGER,
          start_date TEXT,
          activity_type TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating activities table:', err);
          reject(err);
          return;
        }
      });

      // Bikes table - stores user's bicycles
      database.run(`
        CREATE TABLE IF NOT EXISTS bikes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating bikes table:', err);
          reject(err);
          return;
        }
      });

      // Components table - stores components on each bike
      database.run(`
        CREATE TABLE IF NOT EXISTS components (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      `, (err) => {
        if (err) {
          console.error('Error creating components table:', err);
          reject(err);
          return;
        }
      });

      // Component usage table - links activities to components
      database.run(`
        CREATE TABLE IF NOT EXISTS component_usage (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          component_id INTEGER NOT NULL,
          activity_id INTEGER NOT NULL,
          bike_id INTEGER NOT NULL,
          FOREIGN KEY (component_id) REFERENCES components (id) ON DELETE CASCADE,
          FOREIGN KEY (activity_id) REFERENCES activities (id) ON DELETE CASCADE,
          FOREIGN KEY (bike_id) REFERENCES bikes (id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) {
          console.error('Error creating component_usage table:', err);
          reject(err);
          return;
        }
      });

      // Strava tokens table
      database.run(`
        CREATE TABLE IF NOT EXISTS strava_tokens (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          access_token TEXT NOT NULL,
          refresh_token TEXT,
          expires_at INTEGER,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating strava_tokens table:', err);
          reject(err);
          return;
        }
      });

      // Component replacements table - tracks when components were replaced
      database.run(`
        CREATE TABLE IF NOT EXISTS component_replacements (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          category TEXT NOT NULL,
          replacement_date TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating component_replacements table:', err);
          reject(err);
          return;
        }
        resolve();
      });
    });
  });
}

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    const database = getDb();
    database.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    const database = getDb();
    database.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    const database = getDb();
    database.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

module.exports = {
  init,
  query,
  run,
  get,
  getDb
};