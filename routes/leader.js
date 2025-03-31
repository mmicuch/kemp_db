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
    // Convert allergies to array if it's a single value
    if (req.body.alergie && !Array.isArray(req.body.alergie)) {
      req.body.alergie = [req.body.alergie];
    }
    
    // Convert activities to array if it's a single value
    if (req.body.aktivity && !Array.isArray(req.body.aktivity)) {
      req.body.aktivity = [req.body.aktivity];
    }
    
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
