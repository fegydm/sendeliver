// File: server.ts
// Updated with custom WebSocket type definitions

import express from "express";
import cors from "cors";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import * as dotenv from "dotenv";
import aiRouter from "./routes/ai.routes.js";
import geoRouter from "./routes/geo.routes.js";
import deliveryRouter from "./routes/delivery.routes.js";
import vehiclesRouter from "./routes/vehicles.routes.js";
import languageRouter from "./routes/language.routes.js";

// Custom type definitions to avoid importing from Express
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

// Custom WebSocket type definitions
interface CustomWebSocket {
  on(event: string, callback: (...args: any[]) => void): void;
  send(data: string): void;
  ping(): void;
  terminate(): void;
  close(): void;
}

interface ExtendedWebSocket extends CustomWebSocket {
  isAlive: boolean;
}

// Load environment variables
dotenv.config();

// Ensure required environment variables are present
const requiredEnv = ["FRONTEND_PATH", "PUBLIC_PATH", "PORT"];
requiredEnv.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
});

// File and directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../..");
const frontendPath = path.join(projectRoot, process.env.FRONTEND_PATH!);
const publicPath = path.join(projectRoot, process.env.PUBLIC_PATH!);

// Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://sendeliver.com",
    ],
    credentials: true,
  })
);

// Static routes
const staticRoutes = [
  { url: "/pics", path: path.join(publicPath, "pics") },
  { url: "/flags", path: path.join(publicPath, "flags") },
  { url: "/animations", path: path.join(publicPath, "animations") },
  { url: "/assets", path: path.join(frontendPath, "assets") },
];
staticRoutes.forEach((route) => app.use(route.url, express.static(route.path)));

// API routes (must come before SPA fallback)
app.use("/api/ai", aiRouter);
app.use("/api/geo", geoRouter);
app.use("/api/vehicles", vehiclesRouter);
app.use("/api", deliveryRouter);
app.use("/api", languageRouter);

// SPA fallback route
app.get("*", (req: Req, res: Res) => {
  const possibleStaticFile = path.join(publicPath, req.path);
  if (fs.existsSync(possibleStaticFile)) {
    return res.sendFile(possibleStaticFile);
  }
  res.sendFile(path.join(frontendPath, "index.html"));
});

// WebSocket setup
const setupWebSocketServer = (server: http.Server) => {
  const wss = new WebSocketServer({ server });
  const heartbeatInterval = 30000;

  wss.on("connection", (ws: any) => {
    // Use 'any' type or cast to our custom interface
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
        // No logging
      }
    });

    ws.on("error", () => {
      // No logging
    });

    ws.on("close", () => {
      // No logging
    });
  });

  // Heartbeat interval
  const interval = setInterval(() => {
    wss.clients.forEach((ws: any) => {
      // Use 'any' type or cast to our custom interface
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

// Health check
app.get("/api/health", (_req: Req, res: Res) => {
  res.json({ status: "ok" });
});

// Server startup
const PORT = parseInt(process.env.PORT || "5000", 10);
console.log('NODE_ENV:', process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  console.log('Running in development mode');
} else {
  console.log('Running in production mode');
}
server.listen(PORT, "0.0.0.0");