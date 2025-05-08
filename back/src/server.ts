// File: ./back/src/server.ts
// Last change: Added public /api/verify-pin route and unified .env loading

import express, { Request, Response } from "express";
import cors from "cors";
import http from "http";
import path from "path";
import fs from "fs";
import morgan from "morgan";
import * as ua from "express-useragent";
import * as dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";

// Routers
import aiRouter from "./routes/ai.routes.js";
import geoCountriesRouter from "./routes/geo.countries.routes.js";
import geoLanguagesRouter from "./routes/geo.languages.routes.js";
import geoTranslationsRouter from "./routes/geo.translations.routes.js";
import mapsRouter from "./routes/maps.routes.js";
import contactMessagesRoutes from './routes/contact.messages.routes.js';
import vehiclesRouter from "./routes/vehicles.routes.js";
import deliveryRouter from "./routes/delivery.routes.js";
import externalDeliveriesRouter from "./routes/external.deliveries.routes.js";
import authRoutes from "./routes/auth.routes.js";
import verifyPinRouter from "./routes/verify-pin.routes.js"; // Public PIN verify
import { authenticateJWT, checkRole } from "./middlewares/auth.middleware.js";

// ─────────── Derive __dirname in ESM ───────────
// English comment: Compute __dirname from import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─────────── Load .env from project root ───────────
// English comment: Load environment variables once from root .env
dotenv.config({
  path: path.resolve(__dirname, "../..", ".env"),
});

// Use type assertion to help TypeScript understand Express
const app = express() as any;
const server = http.createServer(app as any);

// Global middleware
app.use(express.json());
app.use(cookieParser()); // Added cookie-parser for auth cookies
app.use(ua.express());
morgan.token("isBot", (req: any) => req.useragent.isBot ? "BOT" : "HUMAN");
app.use(morgan(":remote-addr :method :url :status :response-time ms :isBot"));
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://sendeliver.com"
  ],
  credentials: true // Allow cookies over CORS
}));

// Public routes
app.use('/api/auth', authRoutes);
app.use('/api/contact/submit', contactMessagesRoutes);
// Public PIN verification route (no auth required)
app.use('/api/verify-pin', verifyPinRouter);

// Admin routes for contact messages
app.use(
  '/api/contact/admin',
  authenticateJWT,
  checkRole('admin','superadmin'),
  contactMessagesRoutes
);

// Other public API endpoints
app.use("/api/ai", aiRouter);
app.use("/api/geo/countries", geoCountriesRouter);
app.use("/api/geo/languages", geoLanguagesRouter);
app.use("/api/geo/translations", geoTranslationsRouter);
app.use("/api/maps", mapsRouter);
app.use("/api/vehicles", vehiclesRouter);

// Protected deliveries for client, forwarder, carrier, admin, superadmin
app.use(
  "/api",
  authenticateJWT,
  checkRole('client','forwarder','carrier','admin','superadmin'),
  deliveryRouter
);

// External deliveries (client, carrier, superadmin)
app.use(
  "/api/external/deliveries",
  authenticateJWT,
  checkRole('client','carrier','superadmin'),
  externalDeliveriesRouter
);

// Healthcheck endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// Static files and SPA fallback
const projectRoot = path.resolve(__dirname, '../..');
const frontendPath = path.join(projectRoot, process.env.FRONTEND_PATH || "");
const publicPath = path.join(projectRoot, process.env.PUBLIC_PATH || "");

[ ["/pics","pics"], ["/flags","flags"], ["/animations","animations"] ]
  .forEach(([url, dir]) => app.use(url, express.static(path.join(publicPath, dir))));
app.use("/assets", express.static(path.join(frontendPath, "assets")));

app.get("/", (_req: Request, res: Response) =>
  res.sendFile(path.join(frontendPath, "index.html"))
);

const spaFallback: express.RequestHandler = (req: Request, res: Response) => {
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
};
app.use(spaFallback);

// Start server
const PORT = parseInt(process.env.PORT || "5000", 10);
server.listen(PORT, "0.0.0.0", () =>
  console.log(`Server listening on port ${PORT}`)
);