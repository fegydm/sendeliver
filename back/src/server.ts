// File: server.ts
// Last change: Added languageRouter to API routes

import express from "express";
import cors from "cors";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import dotenv from "dotenv";
import aiRouter from "./routes/ai.routes.js";
import geoRouter from "./routes/geo.routes.js";
import deliveryRouter from "./routes/delivery.routes.js";
import vehiclesRouter from "./routes/vehicles.routes.js";
import languageRouter from "./routes/language.routes.js"; // Added new import

dotenv.config();

const requiredEnv = ["FRONTEND_PATH", "PUBLIC_PATH", "PORT"];
requiredEnv.forEach((envVar) => {
  if (!process.env[envVar]) {
    process.exit(1);
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../..");
const frontendPath = path.join(projectRoot, process.env.FRONTEND_PATH);
const publicPath = path.join(projectRoot, process.env.PUBLIC_PATH);

const app = express();
const server = http.createServer(app);

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
app.use(express.static(frontendPath));
app.use(express.static(publicPath));

const staticRoutes = [
  { url: "/pics", path: path.join(publicPath, "pics") },
  { url: "/flags", path: path.join(publicPath, "flags") },
  { url: "/animations", path: path.join(publicPath, "animations") },
  { url: "/assets", path: path.join(frontendPath, "assets") },
];
staticRoutes.forEach((route) => app.use(route.url, express.static(route.path)));

app.use("/api/ai", aiRouter);
app.use("/api/geo", geoRouter);
app.use("/api/vehicles", vehiclesRouter);
app.use("/api", deliveryRouter);
app.use("/api", languageRouter); // Added new router

interface ExtendedWebSocket extends InstanceType<typeof WebSocket> {
  isAlive: boolean;
}

app.get("*", (req, res) => {
  const possibleStaticFile = path.join(publicPath, req.path);
  if (fs.existsSync(possibleStaticFile)) {
    return res.sendFile(possibleStaticFile);
  }
  res.sendFile(path.join(frontendPath, "index.html"));
});

const setupWebSocketServer = (server) => {
  const wss = new WebSocketServer({ server });
  const heartbeatInterval = 30000;

  wss.on("connection", (ws) => {
    ws.isAlive = true;

    ws.on("pong", () => {
      ws.isAlive = true;
    });

    ws.on("message", (message) => {
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

  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.isAlive) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, heartbeatInterval);

  wss.on("close", () => {
    clearInterval(interval);
  });
};

setupWebSocketServer(server);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

const PORT = parseInt(process.env.PORT || "5000", 10);
server.listen(PORT, "0.0.0.0");