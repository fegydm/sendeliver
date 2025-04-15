// File: server.ts
// Fixed version with root path handling and unified geo API

import express from "express";
import cors from "cors";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import * as dotenv from "dotenv";
import aiRouter from './routes/ai.routes.js';
import geoCountriesRouter from './routes/geo.countries.routes.js';
import geoLanguagesRouter from './routes/geo.languages.routes.js';
import geoTranslationsRouter from './routes/geo.translations.routes.js';
import mapsRouter from './routes/maps.routes.js';
import vehiclesRouter from './routes/vehicles.routes.js';
import deliveryRouter from './routes/delivery.routes.js';
import externalDeliveriesRouter from './routes/external.deliveries.routes.js';

// Custom type definitions
interface Req {
  path: string;
  url?: string;
  method?: string;
  params?: any;
  body?: any;
}

interface Res {
  json: (data: any) => void;
  status: (code: number) => Res;
  send: (data: any) => void;
  sendFile: (path: string) => void;
  setHeader?: (name: string, value: string) => void;
  writeHead?: (code: number, headers?: any) => void;
  end?: (data?: any) => void;
}

// Custom WebSocket type
interface ExtendedWebSocket extends WebSocket {
  isAlive: boolean;
}

// Load environment variables
dotenv.config();

// File paths setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../..");
const frontendPath = path.join(projectRoot, process.env.FRONTEND_PATH || "");
const publicPath = path.join(projectRoot, process.env.PUBLIC_PATH || "");

// Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json());

// Fixed CORS configuration using a function instead of an array
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      "http://localhost:3000", 
      "http://localhost:5173", 
      "https://sendeliver.com"
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true
}));

// Static routes
const staticRoutes = [
  { url: "/pics", path: path.join(publicPath, "pics") },
  { url: "/flags", path: path.join(publicPath, "flags") },
  { url: "/animations", path: path.join(publicPath, "animations") },
  { url: "/assets", path: path.join(frontendPath, "assets") },
];
staticRoutes.forEach((route) => app.use(route.url, express.static(route.path)));

// API routes
app.use('/api/ai', aiRouter);
app.use('/api/geo/countries', geoCountriesRouter); // /api/geo/countries
app.use('/api/geo/languages', geoLanguagesRouter); // /api/geo/languages
app.use('/api/geo/translations', geoTranslationsRouter); // /api/geo/translations
app.use('/api/maps', mapsRouter);
app.use('/api/vehicles', vehiclesRouter);
app.use('/api', deliveryRouter); // /api/import-delivery
app.use('/api/external/deliveries', externalDeliveriesRouter); // /api/external/deliveries

// Health check
app.get("/api/health", (_req: Req, res: Res) => {
  res.json({ status: "ok" });
});

// Add explicit handler for root path
app.get("/", (req: Req, res: Res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// SPA fallback - Using app.use instead of app.get("*") to avoid path-to-regexp issues
app.use((req: Req, res: Res) => {
  // Handle 404 for API routes
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: "API endpoint not found" });
  }

  // Try to find a static file
  const possibleStaticFile = path.join(publicPath, req.path);
  if (fs.existsSync(possibleStaticFile)) {
    return res.sendFile(possibleStaticFile);
  }
  
  // Default to index.html for SPA
  res.sendFile(path.join(frontendPath, "index.html"));
});

// WebSocket setup
const setupWebSocketServer = (server: http.Server) => {
  const wss = new WebSocketServer({ server });
  const heartbeatInterval = 30000;

  wss.on("connection", (ws: any) => {
    const extWs = ws as ExtendedWebSocket;
    extWs.isAlive = true;

    ws.on("pong", () => {
      (ws as ExtendedWebSocket).isAlive = true;
    });

    ws.on("message", (message: Buffer | string) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === "ping") {
          ws.send(JSON.stringify({ type: "pong", timestamp: Date.now() }));
        }
      } catch (error) {
        // Silent error handling
      }
    });

    ws.on("error", () => {});
    ws.on("close", () => {});
  });

  // Heartbeat interval
  const interval = setInterval(() => {
    wss.clients.forEach((ws: any) => {
      const extWs = ws as ExtendedWebSocket;
      if (!extWs.isAlive) return ws.terminate();
      extWs.isAlive = false;
      ws.ping();
    });
  }, heartbeatInterval);

  wss.on("close", () => {
    clearInterval(interval);
  });
};

setupWebSocketServer(server);

// Start server
const PORT = parseInt(process.env.PORT || "5000", 10);
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend path: ${frontendPath}`);
  console.log(`Public path: ${publicPath}`);
});
