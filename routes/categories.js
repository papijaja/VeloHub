const express = require('express');
const db = require('../db/database');
const router = express.Router();

const CATEGORIES = ['Chain', 'Power Meter Battery', 'Di2 Shifter Battery', 'Di2 System Battery', 'Tubeless Sealant'];

// Get usage stats for all categories
router.get('/stats', async (req, res) => {
  try {
    const stats = {};
    
    for (const category of CATEGORIES) {
      // Get the most recent replacement date for this category (by entry time, not date)
      const lastReplacement = await db.get(
        'SELECT replacement_date FROM component_replacements WHERE category = ? ORDER BY created_at DESC LIMIT 1',
        [category]
      );
      
      const sinceDate = lastReplacement ? lastReplacement.replacement_date : '1970-01-01';
      
      // Get all activities after the last replacement date (exclude replacement activities and activities on the replacement date itself)
      // Extract date part from start_date (first 10 characters for YYYY-MM-DD) and compare
      // This ensures activities on the replacement date are excluded (only activities AFTER that date are included)
      const activityData = await db.get(
        `SELECT SUM(distance) as total_distance, SUM(moving_time) as total_time 
         FROM activities 
         WHERE SUBSTR(start_date, 1, 10) > ? AND activity_type != 'Replacement'`,
        [sinceDate]
      );
      
      const totalDistanceMeters = activityData?.total_distance || 0;
      const totalTimeSeconds = activityData?.total_time || 0;
      
      // Convert to miles (rounded up) and hours:minutes (rounded up)
      const distanceMiles = Math.ceil(totalDistanceMeters / 1609.34);
      const totalMinutes = Math.ceil(totalTimeSeconds / 60);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const timeFormatted = `${hours}:${minutes.toString().padStart(2, '0')}`;
      
      stats[category] = {
        mileage: distanceMiles,
        time: timeFormatted,
        lastReplacement: lastReplacement ? lastReplacement.replacement_date : null
      };
    }
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching category stats:', error);
    res.status(500).json({ error: 'Failed to fetch category stats' });
  }
});

// Get replacement history for all categories
router.get('/history', async (req, res) => {
  try {
    const history = {};
    
    for (const category of CATEGORIES) {
      const replacements = await db.query(
        'SELECT replacement_date FROM component_replacements WHERE category = ? ORDER BY replacement_date DESC',
        [category]
      );
      
      history[category] = replacements.map(r => r.replacement_date);
    }
    
    res.json(history);
  } catch (error) {
    console.error('Error fetching replacement history:', error);
    res.status(500).json({ error: 'Failed to fetch replacement history' });
  }
});

// Record a replacement
router.post('/replace', async (req, res) => {
  try {
    const { category, date } = req.body;
    
    if (!category || !CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }
    
    // Use provided date or default to today
    const replacementDate = date || new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Record the replacement
    await db.run(
      'INSERT INTO component_replacements (category, replacement_date) VALUES (?, ?)',
      [category, replacementDate]
    );
    
    // Check if a replacement activity already exists for this category and date
    const existingReplacement = await db.get(
      `SELECT id FROM activities 
       WHERE activity_type = 'Replacement' 
       AND name LIKE ? 
       AND DATE(start_date) = ?`,
      [`%${category}%`, replacementDate]
    );
    
    // Only create a replacement activity if one doesn't already exist for this date
    if (!existingReplacement) {
      // Create a special activity entry for the replacement
      // Use a special strava_id that won't conflict (negative number)
      const replacementStravaId = -Date.now(); // Use timestamp as unique negative ID
      
      // Use "Rewaxed" for Chain, "recharged" for Power Meter Battery and Di2 System Battery, "replaced" for others
      let activityName;
      if (category === 'Chain') {
        activityName = `${category} Rewaxed`;
      } else if (category === 'Power Meter Battery' || category === 'Di2 System Battery') {
        activityName = `${category} recharged`;
      } else {
        activityName = `${category} replaced`;
      }
      
      await db.run(
        `INSERT INTO activities (strava_id, name, distance, moving_time, elapsed_time, start_date, activity_type)
         VALUES (?, ?, 0, 0, 0, ?, 'Replacement')`,
        [
          replacementStravaId,
          activityName,
          `${replacementDate}T00:00:00Z`
        ]
      );
    }
    
    res.json({ success: true, replacementDate });
  } catch (error) {
    console.error('Error recording replacement:', error);
    res.status(500).json({ error: 'Failed to record replacement' });
  }
});

module.exports = router;
