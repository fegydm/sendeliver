// File: back/src/server.ts
// Last change: Added device type test routes

console.log('[SERVER START] Starting server initialization...');

import express, { json, static as expressStatic } from "express";
import http from "http";
import path from "path";
import fs from "fs";
import morgan from "morgan";
import * as ua from "express-useragent";
import * as dotenv from "dotenv";
import cookieParser from "cookie-parser";
import session from 'express-session';
import passport from 'passport';
import { fileURLToPath } from "url";
import { WebSocketManager } from './configs/websocket.config.js';
import { PrismaClient, UserRole } from '@prisma/client';
import { configurePassport } from './configs/passport.config.js';

import type { Request, Response, NextFunction } from "express";

import aiRouter from "./routes/ai.routes.js";
import geoCountriesRouter from "./routes/geo.countries.routes.js";
import geoLanguagesRouter from "./routes/geo.languages.routes.js";
import geoTranslationsRouter from "./routes/geo.translations.routes.js";
import mapsRouter from "./routes/maps.routes.js";
import contactMessagesRoutes from "./routes/contact.messages.routes.js";
import vehiclesRouter from "./routes/vehicles.routes.js";
import deliveryRouter from "./routes/delivery.routes.js";
import externalDeliveriesRouter from "./routes/external.deliveries.routes.js";
import { publicAuthRouter, authenticatedAuthRouter } from "./routes/auth.routes.js";
import verifyPinRouter from "./routes/verify-pin.routes.js";
import gpsRouter from "./routes/gps.routes.js";
import { authenticateJWT, checkRole } from "./middlewares/auth.middleware.js";

// NEW: Device type test routes
import { deviceTypeTestRouter } from "./routes/device-type-test.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: "../../.env",
});

console.log('[SERVER ENV CHECK] GOOGLE_CLIENT_ID loaded:', process.env.GOOGLE_CLIENT_ID ? 'YES' : 'NO');
console.log('[SERVER ENV CHECK] GOOGLE_CLIENT_SECRET loaded:', process.env.GOOGLE_CLIENT_SECRET ? 'YES' : 'NO');
console.log('[SERVER ENV CHECK] GOOGLE_CALLBACK_URL loaded:', process.env.GOOGLE_CALLBACK_URL ? 'YES' : 'NO');
console.log('[SERVER ENV CHECK] SESSION_SECRET loaded:', process.env.SESSION_SECRET ? 'YES' : 'NO');
console.log('[SERVER ENV CHECK] NODE_ENV:', process.env.NODE_ENV);

const app = express();
const server = http.createServer(app as any);

WebSocketManager.initialize(server);

// Basic middleware
app.use(json());
app.use(cookieParser());
app.use(ua.express());

// Manual CORS middleware - working configuration
app.use(function (req: Request, res: Response, next: NextFunction) {
  const allowedOrigins = [
    process.env.FRONTEND_URL || "http://localhost:3000",
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
  res.setHeader("Access-Control-Expose-Headers", "Set-Cookie");
  
  if ((req as any).method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_session_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

configurePassport();

interface RequestWithUserAgent extends Request {
  useragent?: {
    isBoten?: boolean;
  };
}

morgan.token("isBoten", (req: RequestWithUserAgent) => req.useragent?.isBoten ? "BOT" : "HUMAN");
app.use(morgan(":remote-addr :method :url :status :response-time ms :isBoten"));

// =============================================================================
// PUBLIC ROUTES (NO AUTHENTICATION REQUIRED)
// =============================================================================

// Auth routes (both public and authenticated)
app.use('/api/auth', publicAuthRouter);
app.use('/api/auth', authenticatedAuthRouter);

// Other public API routes
app.use("/api/ai", aiRouter);
app.use("/api/geo/countries", geoCountriesRouter);
app.use("/api/geo/languages", geoLanguagesRouter);
app.use("/api/geo/translations", geoTranslationsRouter);
app.use("/api/maps", mapsRouter);
app.use("/api/vehicles", vehiclesRouter);
app.use("/api", gpsRouter);
app.use('/api/contact/submit', contactMessagesRoutes);
app.use('/api/verify-pin', verifyPinRouter);

// Health check (public)
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// =============================================================================
// PROTECTED ROUTES (AUTHENTICATION REQUIRED)
// =============================================================================

// Apply authentication only to specific protected routes
app.use("/api/contact/admin", [
  authenticateJWT,
  checkRole(UserRole.org_admin, UserRole.superadmin),
  contactMessagesRoutes
]);

app.use("/api/external/deliveries", [
  authenticateJWT,
  externalDeliveriesRouter
]);

app.use("/api/delivery", [
  authenticateJWT,
  checkRole(UserRole.individual_customer, UserRole.dispatcher, UserRole.org_admin, UserRole.superadmin),
  deliveryRouter
]);

// NEW: Device type test routes (protected)
app.use("/api/device-type-test", [
  authenticateJWT,
  deviceTypeTestRouter
]);

// =============================================================================
// STATIC FILE SERVING
// =============================================================================

const projectRoot = path.resolve(__dirname, "../..");
const frontendPath = path.join(projectRoot, process.env.FRONTEND_PATH || "");
const publicPath = path.join(projectRoot, process.env.PUBLIC_PATH || "");

const staticPaths = [
  ["/pics", "pics"],
  ["/flags", "flags"],
  ["/animations", "animations"]
];

staticPaths.forEach(([url, dir]) => {
  app.use(url, expressStatic(path.join(publicPath, dir)));
});

app.use("/assets", expressStatic(path.join(frontendPath, "assets")));

// Frontend routing
app.get("/", (_req: Request, res: Response) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Catch-all handler
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

// Error handler
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

const PORT = parseInt(process.env.PORT || "10000", 10);
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
  console.log('[DEVICE TYPE] Test routes available at /api/device-type-test');
});