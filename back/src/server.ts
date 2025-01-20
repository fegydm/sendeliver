import express, { Request, Response } from "express";
import cors from "cors";
import http from "http";
import { WebSocketServer } from "ws";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import dotenv from "dotenv";
import aiRouter from "./routes/ai.routes.js";
import geoRouter from "./routes/geo.routes.js";
import deliveryRouter from "./routes/delivery.routes.js";

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
app.use((req: Request, _res: Response, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
app.use(express.static(frontendPath));
app.use(express.static(publicPath));

// Static routes
const staticRoutes = [
  { url: "/pics", path: path.join(publicPath, "pics") },
  { url: "/flags", path: path.join(publicPath, "flags") },
  { url: "/animations", path: path.join(publicPath, "animations") },
  { url: "/assets", path: path.join(frontendPath, "assets") },
];
staticRoutes.forEach((route) => app.use(route.url, express.static(route.path)));

// API routes
app.use("/api/ai", aiRouter);
app.use("/api", deliveryRouter);
app.use("/api/geo", geoRouter);

// SPA fallback route
app.get("*", (req: Request, res: Response) => {
  const possibleStaticFile = path.join(publicPath, req.path);

  if (fs.existsSync(possibleStaticFile)) {
    console.log(`[STATIC] Serving static file: ${possibleStaticFile}`);
    return res.sendFile(possibleStaticFile);
  }

  console.log("[SPA] Serving index.html for:", req.url);
  res.sendFile(path.join(frontendPath, "index.html"));
});

// WebSocket setup
const setupWebSocketServer = (server: http.Server) => {
  const wss = new WebSocketServer({ server });
  const heartbeatInterval = 30000;

  wss.on("connection", (ws) => {
    (ws as any).isAlive = true;

    ws.on("pong", () => {
      (ws as any).isAlive = true;
    });

    ws.on("message", (message: string) => {
      try {
        const data = JSON.parse(message);
        if (data.type === "ping") {
          ws.send(JSON.stringify({ type: "pong", timestamp: Date.now() }));
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    ws.on("close", () => {
      console.log("WebSocket client disconnected");
    });
  });

  // Heartbeat interval
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!(ws as any).isAlive) return ws.terminate();
      (ws as any).isAlive = false;
      ws.ping();
    });
  }, heartbeatInterval);

  wss.on("close", () => {
    clearInterval(interval);
  });

  console.log("WebSocket server set up");
};

setupWebSocketServer(server);

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// Server startup
const PORT = parseInt(process.env.PORT || "5000", 10);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
