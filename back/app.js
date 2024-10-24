// ./back/app.js
import express from 'express';

const app = express();

// Basic test endpoint
app.get('/', (req, res) => {
  res.send('Server is running');
});

// WebSocket test endpoint
app.get('/ws', (req, res) => {
  res.send('WebSocket endpoint ready');
});

export default app;