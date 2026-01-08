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
app.use(express.static('public'));

// Routes
app.use('/api/strava', stravaRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/components', componentsRoutes);
app.use('/api/categories', categoriesRoutes);

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize database and start server
db.init().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Make sure to set up your Strava API credentials in .env file');
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});