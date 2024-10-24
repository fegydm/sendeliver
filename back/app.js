// ./back/app.js
import express from 'express';

const app = express();

// Basic test endpoint
app.get('/', (req, res) => {
  res.send('Server is running');
});

export default app;