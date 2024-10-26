// ./back/app.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Servuj statické súbory z React buildu
app.use(express.static(path.join(__dirname, '../front/build')));

// HSTS header pre prevenciu www pri dvojkliku
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Všetky ostatné GET requesty presmeruj na React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../front/build/index.html'));
});

export default app;