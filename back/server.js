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

// Použitie CORS s konkrétnejšími nastaveniami
app.use(cors({
    origin: ['https://sendeliver.onrender.com', 'http://localhost:5000'],
    credentials: true
}));

// Vytvorenie HTTP servera
const server = http.createServer(app);

// Inicializácia WebSocket servera s ping/pong pre udržanie spojenia
const wss = new WebSocketServer({ server });

const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (!ws.isAlive) return ws.terminate();
        ws.isAlive = false;
        ws.ping();
    });
}, 30000);

wss.on('connection', (ws) => {
    console.log('New WebSocket connection');
    
    ws.isAlive = true;
    ws.on('pong', () => {
        ws.isAlive = true;
    });

    ws.on('message', (message) => {
        console.log('Received:', message.toString());
        // Broadcast správy všetkým klientom
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === ws.OPEN) {
                client.send(message.toString());
            }
        });
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

wss.on('close', () => {
    clearInterval(interval);
});

// API routes musia byť pred static file servingom
app.use('/api', app); // predpokladám, že app.back.js obsahuje API routes

// Servírovanie statických súborov z priečinka 'dist'
const frontendPath = path.join(__dirname, '../../front/dist');
app.use(express.static(frontendPath));

// Zabezpečenie, že všetky neznáme cesty vracajú 'index.html'
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// Nastavenie portu a spustenie servera
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Closing server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});