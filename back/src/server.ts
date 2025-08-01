// File: back/src/server.ts
// Last change: Bypassed TypeScript Express issues with any types

import express from "express";
import http from "http";
import path from "path";
import fs from "fs";
import passport from 'passport';
import { fileURLToPath } from "url";

import { userAgentMiddleware } from './utils/user-agent-parser.js';
import { loadEnv } from './utils/env-loader.js';
import { cookieMiddleware } from './utils/cookie-parser.js';
import { sessionMiddleware } from './utils/session-middleware.js';
import { WebSocketManager } from './configs/websocket.config.js';
import { configurePassport } from './configs/passport.config.js';
import { httpLogger } from './utils/http-logger.js';

// Import centralized routes
import mainApiRouter from "./routes/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

loadEnv();

const app: any = express();
const server = http.createServer(app);

WebSocketManager.initialize(server);

// Basic middleware
app.use(express.json());
app.use(cookieMiddleware);
app.use(userAgentMiddleware);  
app.use(httpLogger);

// CORS
app.use(function (req: any, res: any, next: any) {
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
  
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});

// Session and passport
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

configurePassport();

// API routes
app.use('/api', mainApiRouter);

// Static files
const projectRoot = path.resolve(__dirname, "../..");
const frontendPath = path.join(projectRoot, "front/dist");
const publicPath = path.join(projectRoot, "front/public");

app.use("/pics", express.static(path.join(publicPath, "pics")));
app.use("/flags", express.static(path.join(publicPath, "flags")));
app.use("/animations", express.static(path.join(publicPath, "animations")));
app.use("/assets", express.static(path.join(frontendPath, "assets")));
app.use(express.static(frontendPath));

// Frontend routing
app.get("/", (req: any, res: any) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Catch-all
app.use((req: any, res: any) => {
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
app.use(function (err: any, req: any, res: any, next: any) {
  if (res.headersSent) {
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
  console.log('[ROUTES] All routes available via /api/*');
});
