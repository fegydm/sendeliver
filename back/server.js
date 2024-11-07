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

// Vytvorenie HTTP servera
const server = http.createServer(app);

// Inicializácia WebSocket servera
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    console.log('New WebSocket connection');
    ws.on('message', (message) => {
        console.log('Received:', message);
        // Tu môžeš pridať ďalšiu logiku pre spracovanie správ
    });
    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });
});

// Servírovanie statických súborov z priečinka 'dist'
app.use(express.static(path.join(__dirname, '../front/dist')));

// Zabezpečenie, že všetky neznáme cesty vracajú 'index.html'
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../front/dist/index.html'));
});

// Nastavenie dynamického portu pre Render a iné prostredia
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
