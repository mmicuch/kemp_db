const Activity = require('./models/activity');
const handlebars = require('handlebars');

// Helper pre JSON stringifikovanie
handlebars.registerHelper('json', function(context) {
    return JSON.stringify(context);
});

// Helper pre formátovanie dátumu
handlebars.registerHelper('formatDate', function(date) {
    if (!date) return '';
    return new Date(date).toLocaleDateString('sk-SK');
});

// Helper pre kontrolu rovnosti
handlebars.registerHelper('eq', function(a, b) {
    return a === b;
});

// Helper pre počítanie voľných miest
handlebars.registerHelper('availablePlaces', function(capacity, occupied) {
    return Math.max(0, capacity - (occupied || 0));
});

module.exports = handlebars;