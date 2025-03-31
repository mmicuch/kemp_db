const { pool } = require('../config/db');

class Allergy {
  static async getAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM alergie ORDER BY nazov');
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Allergy;
