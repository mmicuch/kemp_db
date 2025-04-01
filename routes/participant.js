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

// Update the post handler in routes/participant.js
router.post('/register', async (req, res) => {
  try {
    // Spracujeme vlastnú mládež
    if (req.body.mladez === 'ina' && req.body.ina_mladez) {
      // Pridáme novú mládež do databázy
      try {
        // Najprv skontrolujeme, či už mládež neexistuje
        const [existingYouth] = await pool.query('SELECT * FROM mladez WHERE nazov = ?', [req.body.ina_mladez]);
        
        if (existingYouth.length === 0) {
          // Pridáme novú mládež
          await pool.query('INSERT INTO mladez (nazov) VALUES (?)', [req.body.ina_mladez]);
        }
        
        // Nastavíme mladez na zadaný názov
        req.body.mladez = req.body.ina_mladez;
      } catch (youthError) {
        console.error('Chyba pri vytváraní novej mládeže:', youthError);
        // Pokračujeme v registrácii aj keď sa nepodarí vytvoriť novú mládež
      }
    }

    req.body.novy = req.body.novy ? 1 : 0;
    
    // Convert form data for activities
    const aktivity = [];
    if (req.body.aktivity_streda) aktivity.push(req.body.aktivity_streda);
    if (req.body.aktivity_stvrtok) aktivity.push(req.body.aktivity_stvrtok);
    if (req.body.aktivity_piatok) aktivity.push(req.body.aktivity_piatok);
    req.body.aktivity = aktivity;
    
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

// API endpoint pre získanie počtu registrácií pre aktivity
router.get('/api/activity-counts', async (req, res) => {
  try {
    // Získame počty registrácií pre všetky aktivity
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

// API endpoint pre získanie kapacity aktivít
router.get('/api/activities', async (req, res) => {
  try {
    const activities = await Activity.getAll();
    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// API endpoint pre získanie aktivít podľa dňa
router.get('/api/activities/:day', async (req, res) => {
  try {
    const activities = await Activity.getByDay(req.params.day);
    res.json(activities);
  } catch (error) {
    console.error(`Error fetching activities for day ${req.params.day}:`, error);
    res.status(500).json({ error: 'Failed to fetch activities for the specified day' });
  }
});

module.exports = router;