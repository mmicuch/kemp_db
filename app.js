const express = require('express');
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// Import helpers
const helpers = require('./helpers');

// Import database
const { testConnection } = require('./config/db');

// Import routes
const indexRoutes = require('./routes/index');
const participantRoutes = require('./routes/participant');
const leaderRoutes = require('./routes/leader');
const guestRoutes = require('./routes/guest');

// Initialize app
const app = express();

// Test database connection
testConnection();

// Set up view engine with helpers
app.engine('handlebars', engine({
  helpers: helpers
}));
app.set('view engine', 'handlebars');
app.set('views', './views');

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', indexRoutes);
app.use('/participant', participantRoutes);
app.use('/leader', leaderRoutes);
app.use('/guest', guestRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});