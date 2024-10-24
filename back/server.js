// ./back/server.js
import app from './app.js';
import http from 'http';
import { setupWebSocket } from './config/websocket.js';

const server = http.createServer(app);

server.on('upgrade', (request, socket, head) => {
  console.log('Upgrade request received:', {
    path: request.url,
    headers: request.headers
  });
});

// Initialize WebSocket
try {
  const wss = setupWebSocket(server);
  console.log('WebSocket server initialized with config:', {
    path: '/ws',
    server: 'running'
  });
} catch (error) {
  console.error('Failed to initialize WebSocket:', error);
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on:`, {
    port: PORT,
    websocketPath: '/ws'
  });
});