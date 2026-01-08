const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const stravaRoutes = require('./routes/strava');
const activitiesRoutes = require('./routes/activities');
const componentsRoutes = require('./routes/components');
const categoriesRoutes = require('./routes/categories');
const db = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
// Serve static files - use absolute path for serverless compatibility
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/strava', stravaRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/components', componentsRoutes);
app.use('/api/categories', categoriesRoutes);

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize database and start server (only for local development)
if (require.main === module) {
  // This code only runs when server.js is executed directly (local dev)
  db.init().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log('Make sure to set up your Strava API credentials in .env file');
    });
  }).catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
} else {
  // For Vercel/serverless: initialize database on first request
  // Using Vercel Postgres (cloud database)
  let dbInitialized = false;
  app.use(async (req, res, next) => {
    if (!dbInitialized) {
      try {
        await db.init();
        dbInitialized = true;
      } catch (err) {
        console.error('Failed to initialize database:', err);
        return res.status(500).json({ error: 'Database initialization failed' });
      }
    }
    next();
  });
}

// Export the app for Vercel serverless functions
module.exports = app;