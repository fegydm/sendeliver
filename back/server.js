// ./back/server.js
import app from './app.js';
import http from 'http';
import { setupWebSocket } from './config/websocket.js';

const server = http.createServer(app);

// Initialize WebSocket with logging
try {
  const wss = setupWebSocket(server);
  console.log('WebSocket server initialized successfully');
} catch (error) {
  console.error('Failed to initialize WebSocket server:', error);
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`HTTP server running on port ${PORT}`);
  console.log(`WebSocket server should be available at wss://sendeliver.onrender.com/ws`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
});

server.on('upgrade', (request, socket, head) => {
  console.log('Upgrade request received');
});