const { pool } = require('../config/db');

class Accommodation {
  static async getAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM ubytovanie');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async getAvailable() {
    try {
      const [rows] = await pool.query('SELECT * FROM dostupne_ubytovanie');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async getAvailableByType(type) {
    try {
      const [rows] = await pool.query('SELECT * FROM dostupne_ubytovanie WHERE typ = ? OR typ = "spolocne"', [type]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async getAvailableForParticipant(gender) {
    const type = gender === 'M' ? 'muz' : 'zena';
    try {
      const [rows] = await pool.query('SELECT * FROM dostupne_ubytovanie WHERE typ = ? OR typ = "spolocne"', [type]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async getAvailableForLeader() {
    try {
      const [rows] = await pool.query('SELECT * FROM dostupne_ubytovanie WHERE typ = "veduci" OR typ = "spolocne"');
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Accommodation;
