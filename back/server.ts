import express from "express";
import cors from "cors";
import http from "http";
import { WebSocket, WebSocketServer } from "ws";
import path from "path";
import { fileURLToPath } from "url";
import { router as aiRouter } from "./routes/ai.route";

// Definícia rozšíreného typu WebSocket
interface ExtendedWebSocket extends WebSocket {
 isAlive: boolean;
}

console.log("Starting server initialization...");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();

// Debug middleware
app.use((req, res, next) => {
 console.log(`${req.method} ${req.url}`);
 next();
});

// Middleware
app.use(cors());
app.use(express.json());

console.log("Middleware configured...");

// Create HTTP server
const server = http.createServer(app);

// WebSocket server
const wss = new WebSocketServer({ server });

wss.on('connection', (ws: ExtendedWebSocket) => {
 console.log('New WebSocket connection');
 
 ws.isAlive = true;
 ws.on('pong', () => {
   ws.isAlive = true;
 });

 ws.on('message', (message) => {
   console.log('Received:', message.toString());
   try {
     const data = JSON.parse(message.toString());
     switch(data.type) {
       case 'ping':
         ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
         break;
       default:
         console.log('Unhandled message type:', data.type);
     }
   } catch (error) {
     console.error('Error processing message:', error);
   }
 });

 ws.on('error', (error) => {
   console.error('WebSocket error:', error);
 });

 ws.on('close', () => {
   console.log('Client disconnected');
 });
});

// Ping all clients periodically
const interval = setInterval(() => {
 wss.clients.forEach((ws) => {
   const extWs = ws as ExtendedWebSocket;
   if (!extWs.isAlive) return extWs.terminate();
   extWs.isAlive = false;
   extWs.ping();
 });
}, 30000);

wss.on('close', () => {
 clearInterval(interval);
});

console.log("WebSocket server created...");

// API routes
app.use("/api/ai", aiRouter);

app.get("/api/health", (req, res) => {
 console.log("Health check endpoint hit");
 res.json({ status: "ok" });
});

// Serve static files from React build
const frontendPath = path.join(__dirname, "../front/dist");
app.use(express.static(frontendPath));

// SPA fallback - must be after API routes
app.get("*", (req, res) => {
 res.sendFile(path.join(frontendPath, "index.html"));
});

console.log("Routes configured...");

// Start server
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

server.listen({
 port: PORT,
 host: '0.0.0.0'
}, () => {
 console.log(`Server running on port ${PORT}`);
}).on('error', (error) => {
 console.error('Failed to start server:', error);
 if ((error as NodeJS.ErrnoException).code === 'EADDRINUSE') {
   console.error(`Port ${PORT} is already in use`);
 }
});

// Error handling
process.on('uncaughtException', (error) => {
 console.error('Uncaught Exception:', error);
 process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
 console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Graceful shutdown
process.on('SIGTERM', () => {
 console.log('SIGTERM received. Closing server...');
 server.close(() => {
   console.log('Server closed');
   process.exit(0);
 });
});

export default server;