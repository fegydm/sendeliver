const express = require('express');
const path = require('path');

const app = express();

// Middleware na parsovanie JSON requestov
app.use(express.json());

// Obsluhovanie statických súborov z priečinka build (frontend React)
app.use(express.static(path.join(__dirname, '..', 'front', 'build')));

// Definícia jednoduchých API rout (môžeš pridať vlastné API endpointy)
app.get('/api/some-endpoint', (req, res) => {
  res.json({ message: 'Hello from API!' });
});

// Fallback pre všetky ostatné cesty (React Router v SPA aplikácii)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'front', 'build', 'index.html'));
});

module.exports = app;
