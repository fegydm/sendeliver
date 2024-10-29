// ./back/app.js
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Základné nastavenia
app.use(express.json());
app.use(cors());

// API endpointy
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend test endpoint is working' });
});

// Serve React aplikáciu
app.use(express.static(path.join(__dirname, '../front/build')));

// Všetky ostatné requesty presmeruj na React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../front/build/index.html'));
});

export default app;