// ./back/server.js
import express from 'express';
import { setupWebSocket } from './config/websocket.js';
import { initRedis } from './config/redis.js';
import { setHeaders, wwwRedirect } from './utils/errorHandler.js';

const app = express();
const server = http.createServer(app);

// Headers a www redirect
app.use(setHeaders);
app.use(wwwRedirect);

// Initialize WebSocket & Redis
setupWebSocket(server);
initRedis();

server.listen(process.env.PORT || 3000);
