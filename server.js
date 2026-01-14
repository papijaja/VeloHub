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

// Reset entire site (delete all data)
app.post('/api/reset', async (req, res) => {
  try {
    console.log('Resetting entire site - deleting all data');

    // Delete all data in the correct order (respecting foreign keys)
    await db.run('DELETE FROM component_usage');
    await db.run('DELETE FROM component_replacements');
    await db.run('DELETE FROM activities');
    await db.run('DELETE FROM strava_tokens');
    await db.run('DELETE FROM bikes');

    console.log('All data deleted successfully');

    res.json({
      success: true,
      message: 'Site reset successfully. All data has been deleted.'
    });
  } catch (error) {
    console.error('Error resetting site:', error);
    res.status(500).json({
      error: 'Failed to reset site',
      details: error.message
    });
  }
});

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