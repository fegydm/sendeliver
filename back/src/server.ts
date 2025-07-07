// File: back/src/server.ts
// Last change: Fixed Express v5 middleware imports and Request types

import express, { json, static as expressStatic } from "express";
import http from "http";
import path from "path";
import fs from "fs";
import morgan from "morgan";
import * as ua from "express-useragent";
import * as dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import { WebSocketManager } from './configs/websocket.config.js';

// Import types properly for Express v5
import type { Request, Response, NextFunction } from "express";

// Routers
import aiRouter from "./routes/ai.routes.js";
import geoCountriesRouter from "./routes/geo.countries.routes.js";
import geoLanguagesRouter from "./routes/geo.languages.routes.js";
import geoTranslationsRouter from "./routes/geo.translations.routes.js";
import mapsRouter from "./routes/maps.routes.js";
import contactMessagesRoutes from "./routes/contact.messages.routes.js";
import vehiclesRouter from "./routes/vehicles.routes.js";
import deliveryRouter from "./routes/delivery.routes.js";
import externalDeliveriesRouter from "./routes/external.deliveries.routes.js";
import authRoutes from "./routes/auth.routes.js";
import verifyPinRouter from "./routes/verify-pin.routes.js";
import gpsRouter from "./routes/gps.routes.js";
import { authenticateJWT, checkRole } from "./middlewares/auth.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: "../../.env",
});

const app = express();
const server = http.createServer(app as any);

// Initialize WebSocket server
WebSocketManager.initialize(server);

app.use(json());
app.use(cookieParser());
app.use(ua.express());

// Extend Request type for morgan
interface RequestWithUserAgent extends Request {
  useragent?: {
    isBoten?: boolean;
  };
}

morgan.token("isBoten", (req: RequestWithUserAgent) => req.useragent?.isBoten ? "BOT" : "HUMAN");
app.use(morgan(":remote-addr :method :url :status :response-time ms :isBoten"));

// CORS middleware
app.use(function (req: Request, res: Response, next: NextFunction) {
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://sendeliver.com"
  ];
  const origin = req.headers.origin;

  if (typeof origin === "string" && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-Key");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if ((req as any).method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});

// 🟢 Verejné API bez autentifikácie
app.use('/api/auth', authRoutes);
app.use('/api/contact/submit', contactMessagesRoutes);
app.use('/api/verify-pin', verifyPinRouter);

// 🔒 Admin-only route
app.use("/api/contact/admin", [
  authenticateJWT,
  checkRole('admin', 'superadmin'),
  contactMessagesRoutes
]);

// 🔁 Mount external deliveries before protected /api/*
console.log("[server.ts] 🔁 externalDeliveriesRouter mounted");
app.use("/api/external/deliveries", externalDeliveriesRouter);

// 🌍 Otvorené API moduly
app.use("/api/ai", aiRouter);
app.use("/api/geo/countries", geoCountriesRouter);
app.use("/api/geo/languages", geoLanguagesRouter);
app.use("/api/geo/translations", geoTranslationsRouter);
app.use("/api/maps", mapsRouter);
app.use("/api/vehicles", vehiclesRouter);

// 🚛 GPS API - must be BEFORE the protected /api/* section
console.log("[server.ts] 🛰️ GPS router mounted");
app.use("/api", gpsRouter);

// 🔐 Chránené API
app.use("/api", [
  authenticateJWT,
  checkRole('client', 'forwarder', 'carrier', 'admin', 'superadmin'),
  deliveryRouter
]);

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// 🖼️ Frontend assets
const projectRoot = path.resolve(__dirname, "../..");
const frontendPath = path.join(projectRoot, process.env.FRONTEND_PATH || "");
const publicPath = path.join(projectRoot, process.env.PUBLIC_PATH || "");

// Static file serving
const staticPaths = [
  ["/pics", "pics"],
  ["/flags", "flags"], 
  ["/animations", "animations"]
];

staticPaths.forEach(([url, dir]) => {
  app.use(url, expressStatic(path.join(publicPath, dir)));
});

app.use("/assets", expressStatic(path.join(frontendPath, "assets")));

app.get("/", (_req: Request, res: Response) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// 🎯 Fallback pre SPA
app.use((req: Request, res: Response) => {
  if (req.path.startsWith("/api")) {
    res.status(404).json({ error: "API endpoint not found" });
    return;
  }
  
  const filePath = path.join(publicPath, req.path);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.sendFile(path.join(frontendPath, "index.html"));
  }
});

// Global error handler
app.use(function (err: any, req: Request, res: Response, next: NextFunction) {
  if ((res as any).headersSent) {
    return next(err);
  }
  
  if (req.path && req.path.startsWith('/api')) {
    res.status(err.status || 500).json({
      status: 'NOT_OK',
      error: err.message || 'Internal server error'
    });
  } else {
    res.status(err.status || 500).send(`<h1>Server Error</h1><pre>${err.message || 'Unknown error'}</pre>`);
  }
});

// 🚀 Štart servera
const PORT = parseInt(process.env.PORT || "10000", 10);
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
});