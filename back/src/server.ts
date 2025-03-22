// File: back/src/server.ts
// Last change: Fixed imports and WebSocket typing for TypeScript 5.7.3

import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import * as http from "http";
import * as WebSocket from "ws";
import * as path from "path";
import { fileURLToPath } from "url";
import * as fs from "fs";
import * as dotenv from "dotenv";
import aiRouter from "./routes/ai.routes.js";
import geoRouter from "./routes/geo.routes.js";
import deliveryRouter from "./routes/delivery.routes.js";
import vehiclesRouter from "./routes/vehicles.routes.js";
import languageRouter from "./routes/language.routes.js";

dotenv.config();

const requiredEnv: string[] = ["FRONTEND_PATH", "PUBLIC_PATH", "PORT"];
requiredEnv.forEach((envVar: string) => {
  if (!process.env[envVar]) {
    process.exit(1);
  }
});

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);
const projectRoot: string = path.resolve(__dirname, "../..");
const frontendPath: string = path.join(projectRoot, process.env.FRONTEND_PATH!);
const publicPath: string = path.join(projectRoot, process.env.PUBLIC_PATH!);

const app = express();
const server: http.Server = http.createServer(app);

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

const staticRoutes: { url: string; path: string }[] = [
  { url: "/pics", path: path.join(publicPath, "pics") },
  { url: "/flags", path: path.join(publicPath, "flags") },
  { url: "/animations", path: path.join(publicPath, "animations") },
  { url: "/assets", path: path.join(frontendPath, "assets") },
];
staticRoutes.forEach((route: { url: string; path: string }) =>
  app.use(route.url, express.static(route.path))
);

app.use("/api/ai", aiRouter);
app.use("/api/geo", geoRouter);
app.use("/api/vehicles", vehiclesRouter);
app.use("/api", deliveryRouter);
app.use("/api", languageRouter);

interface ExtendedWebSocket extends WebSocket.WebSocket {
  isAlive: boolean;
}

const wss = new WebSocket.WebSocketServer({ server });
const heartbeatInterval: number = 30000;

wss.on("connection", (ws: ExtendedWebSocket) => {
  ws.isAlive = true;

  ws.on("pong", () => {
    ws.isAlive = true;
  });

  ws.on("message", (message: Buffer | string) => {
    try {
      const data: { type: string; [key: string]: any } = JSON.parse(message.toString());
      if (data.type === "ping") {
        ws.send(JSON.stringify({ type: "pong", timestamp: Date.now() }));
      }
    } catch (error: unknown) {
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

const interval: NodeJS.Timeout = setInterval(() => {
  wss.clients.forEach((ws: ExtendedWebSocket) => {
    if (!ws.isAlive) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, heartbeatInterval);

wss.on("close", () => {
  clearInterval(interval);
});

app.get("*", (req: Request, res: Response): void => {
  const possibleStaticFile: string = path.join(publicPath, req.path);
  if (fs.existsSync(possibleStaticFile)) {
    return res.sendFile(possibleStaticFile);
  }
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.get("/api/health", (_req: Request, res: Response): void => {
  res.json({ status: "ok" });
});

const PORT: number = parseInt(process.env.PORT || "5000", 10);
server.listen(PORT, "0.0.0.0");