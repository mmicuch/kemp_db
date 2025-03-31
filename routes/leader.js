const express = require('express');
const router = express.Router();
const Participant = require('../models/participant');
const Activity = require('../models/activity');
const Allergy = require('../models/allergy');
const Accommodation = require('../models/accommodation');
const { pool } = require('../config/db');

// Get leader registration form
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
    
    // Get available accommodations for leaders
    const accommodations = await Accommodation.getAvailableForLeader();
    
    // Get youth groups
    const [youthGroups] = await pool.query('SELECT * FROM mladez ORDER BY nazov');
    
    res.render('register-leader', {
      title: 'Registrácia vedúceho',
      allergies,
      wednesdayActivities,
      thursdayActivities,
      fridayActivities,
      accommodations,
      youthGroups
    });
  } catch (error) {
    console.error('Error loading leader registration form:', error);
    res.status(500).send('Nastala chyba pri načítaní registračného formulára pre vedúceho');
  }
});

// Process leader registration
router.post('/register', async (req, res) => {
  try {
    // Process individual allergies
    const alergie = [];
    // Iterate through all form fields to find allergies
    for (const [key, value] of Object.entries(req.body)) {
      if (key.startsWith('alergia_') && value) {
        // Extract allergy ID from the field name (alergia_1 -> 1)
        const alergiaId = key.split('_')[1];
        alergie.push(alergiaId);
      }
    }
    req.body.alergie = alergie;
    
    // Combine activities from different days into a single array
    req.body.aktivity = [];
    if (req.body.aktivity_streda) req.body.aktivity.push(req.body.aktivity_streda);
    if (req.body.aktivity_stvrtok) req.body.aktivity.push(req.body.aktivity_stvrtok);
    if (req.body.aktivity_piatok) req.body.aktivity.push(req.body.aktivity_piatok);
    
    // Set participant type to leader
    req.body.ucastnik = 'veduci';
    
    // Create leader
    const participantId = await Participant.create(req.body);
    
    res.render('register-success', {
      title: 'Registrácia vedúceho úspešná',
      participant: req.body,
      participantId,
      isLeader: true
    });
  } catch (error) {
    console.error('Error registering leader:', error);
    res.status(500).render('register-error', {
      title: 'Chyba pri registrácii vedúceho',
      error: error.message
    });
  }
});

module.exports = router;