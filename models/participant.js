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

  // In models/participant.js, update the create method:

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
  
      // Insert allergies one by one
      if (participant.alergie && participant.alergie.length > 0) {
        for (const alergiaId of participant.alergie) {
          // Insert with a small delay to avoid database locks
          await connection.query(
            'INSERT INTO os_udaje_alergie (os_udaje_id, alergie_id) VALUES (?, ?)',
            [participantId, parseInt(alergiaId, 10)]
          );
        }
      }
      
      // Check for "other allergy" and create a new entry if provided
      if (participant.ine_alergie && participant.ine_alergie.trim() !== '') {
        // First create a new allergy entry
        const [allergiesResult] = await connection.query(
          'INSERT INTO alergie (nazov, popis) VALUES (?, ?)',
          ['Iné', participant.ine_alergie]
        );
        
        // Then link it to the participant
        const newAllergyId = allergiesResult.insertId;
        await connection.query(
          'INSERT INTO os_udaje_alergie (os_udaje_id, alergie_id) VALUES (?, ?)',
          [participantId, newAllergyId]
        );
      }
      
      // Insert activities if selected
      if (participant.aktivity && participant.aktivity.length > 0) {
        for (const aktivitaId of participant.aktivity) {
          if (aktivitaId) {
            await connection.query(
              'INSERT INTO os_udaje_aktivity (os_udaje_id, aktivita_id) VALUES (?, ?)',
              [participantId, parseInt(aktivitaId, 10)]
            );
          }
        }
      }
      
      // Insert accommodation if selected
      if (participant.ubytovanie) {
        await connection.query(
          'INSERT INTO os_udaje_ubytovanie (os_udaje_id, ubytovanie_id) VALUES (?, ?)',
          [participantId, parseInt(participant.ubytovanie, 10)]
        );
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
