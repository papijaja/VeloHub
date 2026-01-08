const express = require('express');
const db = require('../db/database');
const router = express.Router();

// Get all bikes
router.get('/bikes', async (req, res) => {
  try {
    const bikes = await db.query('SELECT * FROM bikes ORDER BY created_at DESC');
    res.json(bikes);
  } catch (error) {
    console.error('Error fetching bikes:', error);
    res.status(500).json({ error: 'Failed to fetch bikes' });
  }
});

// Create a new bike
router.post('/bikes', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Bike name is required' });
    }

    const result = await db.run(
      'INSERT INTO bikes (name, description) VALUES (?, ?)',
      [name, description || null]
    );

    res.json({ id: result.id, name, description });
  } catch (error) {
    console.error('Error creating bike:', error);
    res.status(500).json({ error: 'Failed to create bike' });
  }
});

// Get all components for a bike
router.get('/bikes/:bikeId/components', async (req, res) => {
  try {
    const components = await db.query(`
      SELECT 
        c.*,
        COALESCE(SUM(a.distance), 0) as total_distance_meters,
        COALESCE(SUM(a.moving_time), 0) as total_moving_time_seconds
      FROM components c
      LEFT JOIN component_usage cu ON c.id = cu.component_id
      LEFT JOIN activities a ON cu.activity_id = a.id
      WHERE c.bike_id = ?
      GROUP BY c.id
      ORDER BY c.name
    `, [req.params.bikeId]);

    const formattedComponents = components.map(comp => ({
      ...comp,
      total_distance_miles: (comp.total_distance_meters / 1609.34).toFixed(2),
      total_moving_time_hours: (comp.total_moving_time_seconds / 3600).toFixed(2),
      usage_distance_miles: ((comp.total_distance_meters - comp.install_distance) / 1609.34).toFixed(2)
    }));

    res.json(formattedComponents);
  } catch (error) {
    console.error('Error fetching components:', error);
    res.status(500).json({ error: 'Failed to fetch components' });
  }
});

// Create a new component
router.post('/bikes/:bikeId/components', async (req, res) => {
  try {
    const { name, component_type, install_date, install_distance, service_interval_miles, service_interval_time, notes } = req.body;
    
    if (!name || !component_type) {
      return res.status(400).json({ error: 'Component name and type are required' });
    }

    const result = await db.run(
      `INSERT INTO components (bike_id, name, component_type, install_date, install_distance, service_interval_miles, service_interval_time, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.params.bikeId,
        name,
        component_type,
        install_date || null,
        install_distance || 0,
        service_interval_miles || null,
        service_interval_time || null,
        notes || null
      ]
    );

    res.json({ id: result.id, ...req.body });
  } catch (error) {
    console.error('Error creating component:', error);
    res.status(500).json({ error: 'Failed to create component' });
  }
});

// Link activities to a component
router.post('/bikes/:bikeId/components/:componentId/activities', async (req, res) => {
  try {
    const { activity_ids } = req.body;
    
    if (!Array.isArray(activity_ids)) {
      return res.status(400).json({ error: 'activity_ids must be an array' });
    }

    let linked = 0;
    for (const activityId of activity_ids) {
      // Check if link already exists
      const existing = await db.get(
        'SELECT id FROM component_usage WHERE component_id = ? AND activity_id = ?',
        [req.params.componentId, activityId]
      );

      if (!existing) {
        await db.run(
          'INSERT INTO component_usage (component_id, activity_id, bike_id) VALUES (?, ?, ?)',
          [req.params.componentId, activityId, req.params.bikeId]
        );
        linked++;
      }
    }

    res.json({ success: true, linked });
  } catch (error) {
    console.error('Error linking activities:', error);
    res.status(500).json({ error: 'Failed to link activities' });
  }
});

// Get component details with usage
router.get('/bikes/:bikeId/components/:componentId', async (req, res) => {
  try {
    const component = await db.get(
      'SELECT * FROM components WHERE id = ? AND bike_id = ?',
      [req.params.componentId, req.params.bikeId]
    );

    if (!component) {
      return res.status(404).json({ error: 'Component not found' });
    }

    const activities = await db.query(`
      SELECT a.* FROM activities a
      INNER JOIN component_usage cu ON a.id = cu.activity_id
      WHERE cu.component_id = ?
      ORDER BY a.start_date DESC
    `, [req.params.componentId]);

    const stats = await db.get(`
      SELECT 
        COALESCE(SUM(a.distance), 0) as total_distance_meters,
        COALESCE(SUM(a.moving_time), 0) as total_moving_time_seconds,
        COUNT(a.id) as activity_count
      FROM component_usage cu
      LEFT JOIN activities a ON cu.activity_id = a.id
      WHERE cu.component_id = ?
    `, [req.params.componentId]);

    res.json({
      ...component,
      activities: activities.map(a => ({
        ...a,
        distance_miles: (a.distance / 1609.34).toFixed(2),
        moving_time_formatted: formatTime(a.moving_time)
      })),
      stats: {
        total_distance_miles: (stats.total_distance_meters / 1609.34).toFixed(2),
        total_moving_time_hours: (stats.total_moving_time_seconds / 3600).toFixed(2),
        activity_count: stats.activity_count
      }
    });
  } catch (error) {
    console.error('Error fetching component:', error);
    res.status(500).json({ error: 'Failed to fetch component' });
  }
});

// Helper function to format time
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  }
  return `${minutes}`;
}

module.exports = router;