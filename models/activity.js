const { pool } = require('../config/db');

// Activity model
const Activity = {
    // Get all activities
    async getAll() {
        try {
            const [rows] = await pool.query('SELECT * FROM aktivity ORDER BY den, nazov');
            return rows;
        } catch (error) {
            console.error('Error fetching activities:', error);
            throw error;
        }
    },
    
    // Get activities by day
    async getByDay(day) {
        try {
            const [rows] = await pool.query('SELECT * FROM aktivity WHERE den = ? ORDER BY nazov', [day]);
            return rows;
        } catch (error) {
            console.error(`Error fetching activities for day ${day}:`, error);
            throw error;
        }
    },
    
    // Get activity by ID
    async getById(id) {
        try {
            const [rows] = await pool.query('SELECT * FROM aktivity WHERE id = ?', [id]);
            return rows[0];
        } catch (error) {
            console.error(`Error fetching activity with ID ${id}:`, error);
            throw error;
        }
    },
    
    // Count registrations for an activity
    async countRegistrations(activityId) {
        try {
            const [rows] = await pool.query(
                'SELECT COUNT(*) AS count FROM os_udaje_aktivity WHERE aktivita_id = ?', 
                [activityId]
            );
            return rows[0].count;
        } catch (error) {
            console.error(`Error counting registrations for activity ${activityId}:`, error);
            throw error;
        }
    },
    
    // Check if activity is full
    async isFull(activityId) {
        try {
            const activity = await this.getById(activityId);
            const count = await this.countRegistrations(activityId);
            return count >= activity.kapacita;
        } catch (error) {
            console.error(`Error checking if activity ${activityId} is full:`, error);
            throw error;
        }
    }
};

module.exports = Activity;