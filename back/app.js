// Import Express frameworku
const express = require('express');
const app = express();

// Middleware pre spracovanie JSON requestov
app.use(express.json());

// Základná routa pre testovanie
app.get('/', (req, res) => {
  res.send('Hello from the app!');
});

module.exports = app;

