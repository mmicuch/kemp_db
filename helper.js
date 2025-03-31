const Activity = require('./models/activity');

module.exports = {
  // Helper to subtract two numbers
  subtract: function(a, b) {
    return a - b;
  },
  
  // Helper to count activity registrations
  countRegistrations: async function(activityId) {
    try {
      return await Activity.countRegistrations(activityId);
    } catch (error) {
      console.error(`Error counting registrations: ${error}`);
      return 0;
    }
  },
  
  // Helper to convert object to JSON for use in JavaScript
  json: function(context) {
    return JSON.stringify(context);
  }
};