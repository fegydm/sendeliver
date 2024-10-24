// ./back/app.js
import express from 'express';

const app = express();

// Enable WebSocket upgrade
app.use((req, res, next) => {
  res.setHeader('Upgrade', 'websocket');
  res.setHeader('Connection', 'Upgrade');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.get('/ws', (req, res) => {
  res.send('WebSocket endpoint ready');
});

export default app;