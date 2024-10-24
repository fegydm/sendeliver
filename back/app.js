// ./back/app.js
import express from 'express';

const app = express();

// HSTS header pre prevenciu www pri dvojkliku
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Basic test endpoint
app.get('/', (req, res) => {
  res.send('Server is running');
});

// WebSocket test endpoint
app.get('/ws', (req, res) => {
  res.send('WebSocket endpoint ready');
});

// Log všetkých požiadaviek
app.use((req, res, next) => {
  console.log('Incoming request:', req.method, req.url);
  next();
});

export default app;