const express = require('express');
const router = express.Router();
const Participant = require('../models/participant');
const Activity = require('../models/activity');
const Allergy = require('../models/allergy');
const Accommodation = require('../models/accommodation');
const { pool } = require('../config/db');

// Get registration form
router.get('/register', async (req, res) => {
  try {
    // Get all required data for the form
    const allergies = await Allergy.getAll();
    const wednesdayActivities = await Activity.getByDay('streda');
    const thursdayActivities = await Activity.getByDay('stvrtok');
    const fridayActivities = await Activity.getByDay('piatok');
    
    // Pre-calculate available places for each activity
    for (const activity of [...wednesdayActivities, ...thursdayActivities, ...fridayActivities]) {
      const registrations = await Activity.countRegistrations(activity.id);
      activity.availablePlaces = activity.kapacita - registrations;
    }
    
    // Get available accommodations for participants
    // Since we don't know gender yet, we'll use JavaScript to filter later
    const accommodations = await Accommodation.getAvailable();
    
    // Get youth groups
    const [youthGroups] = await pool.query('SELECT * FROM mladez ORDER BY nazov');
    
    res.render('register', {
      title: 'Registrácia účastníka',
      allergies,
      wednesdayActivities,
      thursdayActivities,
      fridayActivities,
      accommodations,
      youthGroups
    });
  } catch (error) {
    console.error('Error loading registration form:', error);
    res.status(500).send('Nastala chyba pri načítaní registračného formulára');
  }
});

// Process registration
router.post('/register', async (req, res) => {
  try {
    // Convert form data for activities
    const aktivity = [];
    if (req.body.aktivity_streda) aktivity.push(req.body.aktivity_streda);
    if (req.body.aktivity_stvrtok) aktivity.push(req.body.aktivity_stvrtok);
    if (req.body.aktivity_piatok) aktivity.push(req.body.aktivity_piatok);
    req.body.aktivity = aktivity;
    
    // Convert allergies to array if it's a single value
    if (req.body.alergie && !Array.isArray(req.body.alergie)) {
      req.body.alergie = [req.body.alergie];
    }
    
    // Set participant type
    req.body.ucastnik = 'taborujuci';
    
    // Create participant
    const participantId = await Participant.create(req.body);
    
    res.render('register-success', {
      title: 'Registrácia úspešná',
      participant: req.body,
      participantId
    });
  } catch (error) {
    console.error('Error registering participant:', error);
    res.status(500).render('register-error', {
      title: 'Chyba pri registrácii',
      error: error.message
    });
  }
});

router.get('/api/activity-counts', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT aktivita_id, COUNT(*) as count 
      FROM os_udaje_aktivity 
      GROUP BY aktivita_id
    `);
    
    // Convert to object with activity_id as keys
    const counts = {};
    rows.forEach(row => {
      counts[row.aktivita_id] = row.count;
    });
    
    res.json(counts);
  } catch (error) {
    console.error('Error fetching activity counts:', error);
    res.status(500).json({ error: 'Failed to fetch activity counts' });
  }
});

module.exports = router;