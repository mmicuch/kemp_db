const express = require('express');
const router = express.Router();
const Participant = require('../models/participant');
const Activity = require('../models/activity');
const Allergy = require('../models/allergy');
const Accommodation = require('../models/accommodation');
const { pool } = require('../config/db');

// Get guest registration form
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
    
    // Get all accommodations since we don't know gender yet
    const accommodations = await Accommodation.getAvailable();
    
    res.render('register-guest', {
      title: 'Registrácia hosťa',
      allergies,
      wednesdayActivities,
      thursdayActivities,
      fridayActivities,
      accommodations
    });
  } catch (error) {
    console.error('Error loading guest registration form:', error);
    res.status(500).send('Nastala chyba pri načítaní registračného formulára pre hosťa');
  }
});

// Process guest registration
router.post('/register', async (req, res) => {
  try {
    // Convert allergies to array if it's a single value
    if (req.body.alergie && !Array.isArray(req.body.alergie)) {
      req.body.alergie = [req.body.alergie];
    }
    
    // Combine activities from different days into a single array (if selected)
    req.body.aktivity = [];
    if (req.body.aktivity_streda) req.body.aktivity.push(req.body.aktivity_streda);
    if (req.body.aktivity_stvrtok) req.body.aktivity.push(req.body.aktivity_stvrtok);
    if (req.body.aktivity_piatok) req.body.aktivity.push(req.body.aktivity_piatok);
    
    // Set participant type to guest
    req.body.ucastnik = 'host';
    
    // Create guest
    const participantId = await Participant.create(req.body);
    
    res.render('register-success', {
      title: 'Registrácia hosťa úspešná',
      participant: req.body,
      participantId,
      isGuest: true
    });
  } catch (error) {
    console.error('Error registering guest:', error);
    res.status(500).render('register-error', {
      title: 'Chyba pri registrácii hosťa',
      error: error.message
    });
  }
});

module.exports = router;