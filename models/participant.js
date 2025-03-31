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
    try {
      // Insert into os_udaje table
      const [result] = await pool.query(
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
      
      // Insert allergies
      if (participant.alergie && participant.alergie.length > 0) {
        const allergiesValues = participant.alergie.map(allergieId => [participantId, allergieId]);
        await pool.query(
          'INSERT INTO os_udaje_alergie (os_udaje_id, alergie_id) VALUES ?',
          [allergiesValues]
        );
      }
      
      // Insert custom allergy note if provided
      if (participant.ine_alergie && participant.ine_alergie.trim() !== '') {
        await pool.query(
          'UPDATE os_udaje SET poznamka = CONCAT(IFNULL(poznamka, ""), "Iné alergie: ", ?) WHERE id = ?',
          [participant.ine_alergie, participantId]
        );
      }
      
      // Insert activities
      if (participant.aktivity && participant.aktivity.length > 0) {
        const activitiesValues = participant.aktivity.map(activityId => [participantId, activityId]);
        await pool.query(
          'INSERT INTO os_udaje_aktivity (os_udaje_id, aktivita_id) VALUES ?',
          [activitiesValues]
        );
      }
      
      // Insert accommodation
      if (participant.ubytovanie) {
        await pool.query(
          'INSERT INTO os_udaje_ubytovanie (os_udaje_id, ubytovanie_id) VALUES (?, ?)',
          [participantId, participant.ubytovanie]
        );
      }
      
      return participantId;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Participant;
