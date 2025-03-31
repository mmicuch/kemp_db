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
    // Convert allergies to array if it's a single value
    if (req.body.alergie && !Array.isArray(req.body.alergie)) {
      req.body.alergie = [req.body.alergie];
    }
    
    // Convert activities to array if it's a single value
    if (req.body.aktivity && !Array.isArray(req.body.aktivity)) {
      req.body.aktivity = [req.body.aktivity];
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

module.exports = router;
