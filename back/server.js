// ./back/server.js
import express from 'express';
import cors from 'cors';
import app from './app.back.js';
import http from 'http';
import { WebSocketServer } from 'ws';

// Použitie CORS
app.use(cors({
    origin: '*', // Na vývojové účely povoľujeme všetky domény. Na produkciu zváž konkrétne domény.
}));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Sledovanie pripojených klientov
const clients = new Map(); // ukladáme {clientId: ws}

wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', (rawData) => {
        try {
            const message = JSON.parse(rawData);
            console.log('Received message:', message);

            switch (message.type) {
                case 'delivery_request':
                    // Broadcast všetkým dopravcom
                    broadcastToHaulers(message);
                    break;

                case 'delivery_offer':
                    // Poslať ponuku konkrétnemu klientovi
                    sendToClient(message.requestId, message);
                    break;

                case 'client_init':
                    // Klient sa identifikuje
                    clients.set(message.clientId, {
                        ws,
                        type: 'sender'
                    });
                    break;

                case 'hauler_init':
                    // Dopravca sa identifikuje
                    clients.set(message.haulerId, {
                        ws,
                        type: 'hauler'
                    });
                    break;

                default:
                    console.log('Unknown message type:', message.type);
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('close', () => {
        // Cleanup pri odpojení
        for (const [id, client] of clients.entries()) {
            if (client.ws === ws) {
                clients.delete(id);
                break;
            }
        }
        console.log('Client disconnected');
    });
});

// Helper funkcie
function broadcastToHaulers(message) {
    clients.forEach((client) => {
        if (client.type === 'hauler') {
            client.ws.send(JSON.stringify(message));
        }
    });
}

function sendToClient(clientId, message) {
    const client = clients.get(clientId);
    if (client) {
        client.ws.send(JSON.stringify(message));
    }
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log('Server running on port:', PORT);
});
