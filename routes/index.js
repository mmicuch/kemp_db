const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// Home page route
router.get('/', async (req, res) => {
  try {
    // Get counts for display on homepage
    const [activityCount] = await pool.query('SELECT COUNT(*) as count FROM aktivity');
    const [participantCount] = await pool.query('SELECT COUNT(*) as count FROM os_udaje WHERE ucastnik = "taborujuci"');
    const [leaderCount] = await pool.query('SELECT COUNT(*) as count FROM os_udaje WHERE ucastnik = "veduci"');
    const [guestCount] = await pool.query('SELECT COUNT(*) as count FROM os_udaje WHERE ucastnik = "host"');
    
    res.render('index', {
      title: 'Registračný systém',
      activityCount: activityCount[0].count,
      participantCount: participantCount[0].count,
      leaderCount: leaderCount[0].count,
      guestCount: guestCount[0].count
    });
  } catch (error) {
    console.error('Error loading index page:', error);
    res.status(500).send('Nastala chyba pri načítaní stránky');
  }
});

module.exports = router;
