// ./back/server.js
import app from './app.js';
import http from 'http';
import { WebSocketServer } from 'ws';  // zmenené - importujeme priamo tu

const server = http.createServer(app);

// Vytvoríme WebSocket server priamo tu
const wss = new WebSocketServer({ server });

// Logovanie pokusov o spojenie
wss.on('connection', (ws) => {
    console.log('WebSocket client connected!');
    ws.send('Hello from server!');
});

// Logovanie http upgrade requestov
server.on('upgrade', (request, socket, head) => {
    console.log('Upgrade request received!');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('Server is running on port:', PORT);
});