const express = require('express');
const db = require('../db/database');
const router = express.Router();

// Get all activities
router.get('/', async (req, res) => {
  try {
    const activities = await db.query(`
      SELECT 
        a.*,
        (SELECT COUNT(*) FROM component_usage cu WHERE cu.activity_id = a.id) as component_count
      FROM activities a
      ORDER BY a.start_date DESC
    `);
    
    // Convert distance from meters to miles (rounded up) and time to hours:minutes (rounded up)
    const formattedActivities = activities.map(activity => {
      // Check if this is a replacement activity
      if (activity.activity_type === 'Replacement') {
        return {
          ...activity,
          distance_miles: 0,
          moving_time_minutes: 0,
          distance_miles_formatted: '0',
          moving_time_formatted: '0:00',
          is_replacement: true
        };
      }
      
      const distanceMiles = activity.distance / 1609.34;
      const distanceRounded = Math.ceil(distanceMiles); // Round up to nearest whole number
      
      // Round up to nearest minute, then convert to hours:minutes
      const totalMinutes = Math.ceil(activity.moving_time / 60);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      
      // Always format as H:MM (use 0:MM for times less than an hour)
      const timeFormatted = `${hours}:${minutes.toString().padStart(2, '0')}`;
      
      return {
        ...activity,
        distance_miles: distanceRounded,
        moving_time_minutes: totalMinutes,
        distance_miles_formatted: distanceRounded.toString(),
        moving_time_formatted: timeFormatted,
        is_replacement: false
      };
    });

    res.json(formattedActivities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Get activity statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await db.get(`
      SELECT 
        COUNT(*) as total_activities,
        SUM(distance) as total_distance_meters,
        SUM(moving_time) as total_moving_time_seconds
      FROM activities
    `);

    res.json({
      total_activities: stats.total_activities || 0,
      total_distance_miles: stats.total_distance_meters ? (stats.total_distance_meters / 1609.34).toFixed(2) : 0,
      total_moving_time_hours: stats.total_moving_time_seconds ? (stats.total_moving_time_seconds / 3600).toFixed(2) : 0,
      total_moving_time_formatted: stats.total_moving_time_seconds ? formatTime(stats.total_moving_time_seconds) : '0:00'
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get single activity
router.get('/:id', async (req, res) => {
  try {
    const activity = await db.get(
      'SELECT * FROM activities WHERE id = ?',
      [req.params.id]
    );

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    res.json({
      ...activity,
      distance_miles: (activity.distance / 1609.34).toFixed(2),
      moving_time_hours: (activity.moving_time / 3600).toFixed(2),
      moving_time_formatted: formatTime(activity.moving_time)
    });
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

// Helper function to format seconds to HH:MM:SS
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

module.exports = router;