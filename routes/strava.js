const express = require('express');
const axios = require('axios');
const db = require('../db/database');
const router = express.Router();

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const REDIRECT_URI = process.env.STRAVA_REDIRECT_URI || 'http://localhost:3000/api/strava/callback';

// Get authorization URL
router.get('/auth', (req, res) => {
  // Validate that Strava credentials are configured
  if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET) {
    return res.status(500).json({ 
      error: 'Strava API credentials not configured. Please set STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET in your .env file.' 
    });
  }

  const scope = 'activity:read_all';
  const authUrl = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${scope}`;
  
  console.log('Generated Strava auth URL with redirect_uri:', REDIRECT_URI);
  res.json({ authUrl });
});

// Handle OAuth callback
router.get('/callback', async (req, res) => {
  const { code, error } = req.query;
  
  // Handle Strava errors (e.g., user denied access)
  if (error) {
    console.error('Strava OAuth error:', error);
    return res.redirect(`/?error=${encodeURIComponent(error)}`);
  }
  
  if (!code) {
    return res.redirect('/?error=no_code');
  }

  try {
    // Exchange code for token
    const response = await axios.post('https://www.strava.com/oauth/token', {
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code'
    });

    const { access_token, refresh_token, expires_at } = response.data;

    // Store token in database
    await db.run(
      'DELETE FROM strava_tokens'
    );
    await db.run(
      'INSERT INTO strava_tokens (access_token, refresh_token, expires_at) VALUES (?, ?, ?)',
      [access_token, refresh_token, expires_at]
    );

    res.redirect('/?auth=success');
  } catch (error) {
    console.error('Error exchanging code for token:', error.response?.data || error.message);
    res.redirect('/?error=token_exchange_failed');
  }
});

// Get stored token
router.get('/token', async (req, res) => {
  try {
    const token = await db.get('SELECT * FROM strava_tokens ORDER BY id DESC LIMIT 1');
    
    if (!token) {
      return res.status(404).json({ error: 'No token found. Please authenticate first.' });
    }

    // Check if token is expired
    if (token.expires_at && Date.now() / 1000 >= token.expires_at) {
      // Token expired, try to refresh
      try {
        const refreshResponse = await axios.post('https://www.strava.com/oauth/token', {
          client_id: STRAVA_CLIENT_ID,
          client_secret: STRAVA_CLIENT_SECRET,
          refresh_token: token.refresh_token,
          grant_type: 'refresh_token'
        });

        const { access_token, refresh_token: new_refresh_token, expires_at } = refreshResponse.data;

        await db.run(
          'UPDATE strava_tokens SET access_token = ?, refresh_token = ?, expires_at = ? WHERE id = ?',
          [access_token, new_refresh_token, expires_at, token.id]
        );

        return res.json({ 
          access_token: access_token,
          hasToken: true 
        });
      } catch (refreshError) {
        return res.status(401).json({ error: 'Token expired and refresh failed. Please re-authenticate.' });
      }
    }

    res.json({ 
      access_token: token.access_token,
      hasToken: true 
    });
  } catch (error) {
    console.error('Error getting token:', error);
    res.status(500).json({ error: 'Failed to get token' });
  }
});

// Sync activities from Strava
router.post('/sync', async (req, res) => {
  try {
    const token = await db.get('SELECT * FROM strava_tokens ORDER BY id DESC LIMIT 1');
    
    if (!token) {
      return res.status(401).json({ error: 'No token found. Please authenticate first.' });
    }

    // Check if token is expired and refresh if needed
    let accessToken = token.access_token;
    if (token.expires_at && Date.now() / 1000 >= token.expires_at) {
      const refreshResponse = await axios.post('https://www.strava.com/oauth/token', {
        client_id: STRAVA_CLIENT_ID,
        client_secret: STRAVA_CLIENT_SECRET,
        refresh_token: token.refresh_token,
        grant_type: 'refresh_token'
      });
      accessToken = refreshResponse.data.access_token;
    }

    // Fetch activities from Strava
    const activitiesResponse = await axios.get('https://www.strava.com/api/v3/athlete/activities', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      params: {
        per_page: 200 // Maximum per page
      }
    });

    const activities = activitiesResponse.data;
    let synced = 0;
    let skipped = 0;

    for (const activity of activities) {
      // Check if activity already exists
      const existing = await db.get(
        'SELECT id FROM activities WHERE strava_id = ?',
        [activity.id]
      );

      if (!existing) {
        // Only sync Ride activities (exclude VirtualRide)
        if (activity.type === 'Ride') {
          await db.run(
            `INSERT INTO activities (strava_id, name, distance, moving_time, elapsed_time, start_date, activity_type)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              activity.id,
              activity.name,
              activity.distance, // in meters
              activity.moving_time, // in seconds
              activity.elapsed_time, // in seconds
              activity.start_date,
              activity.type
            ]
          );
          synced++;
        } else {
          skipped++;
        }
      } else {
        skipped++;
      }
    }

    res.json({
      success: true,
      synced,
      skipped,
      total: activities.length
    });
  } catch (error) {
    console.error('Error syncing activities:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to sync activities',
      details: error.response?.data || error.message
    });
  }
});

module.exports = router;