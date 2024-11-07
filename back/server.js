import express from 'express';
import cors from 'cors';
import http from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './app.back.js';

// Definovanie __filename a __dirname pre ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Použitie CORS
app.use(cors({
    origin: '*', // Na vývojové účely povoľujeme všetky domény. Na produkciu zváž konkrétne domény.
}));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// (WebSocket a ďalšia logika)

app.use(express.static(path.join(__dirname, '../front/dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../front/dist/index.html'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
