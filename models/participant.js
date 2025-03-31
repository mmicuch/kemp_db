const { pool } = require('../config/db');

class Participant {
  static async getAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM os_udaje');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async create(participant) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Insert participant
      const [result] = await connection.query(
        'INSERT INTO os_udaje (meno, priezvisko, datum_narodenia, pohlavie, mladez, poznamka, mail, ucastnik, GDPR) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          participant.meno,
          participant.priezvisko,
          participant.datum_narodenia,
          participant.pohlavie,
          participant.mladez,
          participant.poznamka,
          participant.mail,
          participant.ucastnik || 'taborujuci',
          participant.gdpr ? 1 : 0
        ]
      );
      
      const participantId = result.insertId;

      // Insert allergies one by one to avoid lock timeout
      if (participant.alergie && participant.alergie.length > 0) {
        for (const alergiaId of participant.alergie) {
          await connection.query(
            'INSERT INTO os_udaje_alergie (os_udaje_id, alergie_id) VALUES (?, ?)',
            [participantId, parseInt(alergiaId, 10)]
          );
        }
      }

      await connection.commit();
      return participantId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = Participant;
