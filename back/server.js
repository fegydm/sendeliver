// ./back/server.js
import app from './app.js';
import http from 'http';
import { setupWebSocket } from './config/websocket.js';

const server = http.createServer(app);

// Initialize WebSocket
setupWebSocket(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});