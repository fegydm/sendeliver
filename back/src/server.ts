// File: ./back/src/server.ts
// Last change: Fixed req.method type error, removed cors/nodemailer

import express_import from "express";
const express = express_import as any;

import type { Request, Response, NextFunction } from "express";
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
import contactMessagesRoutes from "./routes/contact.messages.routes.js";
import vehiclesRouter from "./routes/vehicles.routes.js";
import deliveryRouter from "./routes/delivery.routes.js";
import externalDeliveriesRouter from "./routes/external.deliveries.routes.js";
import authRoutes from "./routes/auth.routes.js";
import verifyPinRouter from "./routes/verify-pin.routes.js";
import { authenticateJWT, checkRole } from "./middlewares/auth.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../..", ".env"),
});

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cookieParser());
app.use(ua.express());
morgan.token("isBot", (req: any) => req.useragent.isBot ? "BOT" : "HUMAN");
app.use(morgan(":remote-addr :method :url :status :response-time ms :isBot"));

app.use((req: Request, res: Response, next: NextFunction) => {
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
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if ((req as any).method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/contact/submit', contactMessagesRoutes);
app.use('/api/verify-pin', verifyPinRouter);

app.use('/api/contact/admin', [
  authenticateJWT,
  checkRole('admin', 'superadmin'),
  contactMessagesRoutes
]);

app.use("/api/ai", aiRouter);
app.use("/api/geo/countries", geoCountriesRouter);
app.use("/api/geo/languages", geoLanguagesRouter);
app.use("/api/geo/translations", geoTranslationsRouter);
app.use("/api/maps", mapsRouter);
app.use("/api/vehicles", vehiclesRouter);

app.use("/api", [
  authenticateJWT,
  checkRole('client', 'forwarder', 'carrier', 'admin', 'superadmin'),
  deliveryRouter
]);

app.use("/api/external/deliveries", [
  authenticateJWT,
  checkRole('client', 'carrier', 'superadmin'),
  externalDeliveriesRouter
]);

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

const projectRoot = path.resolve(__dirname, '../..');
const frontendPath = path.join(projectRoot, process.env.FRONTEND_PATH || "");
const publicPath = path.join(projectRoot, process.env.PUBLIC_PATH || "");

[["/pics", "pics"], ["/flags", "flags"], ["/animations", "animations"]]
  .forEach(([url, dir]) => app.use(url, express.static(path.join(publicPath, dir))));
app.use("/assets", express.static(path.join(frontendPath, "assets")));

app.get("/", (_req: Request, res: Response) =>
  res.sendFile(path.join(frontendPath, "index.html"))
);

type RequestHandler = (req: Request, res: Response, next: NextFunction) => void;

const spaFallback: RequestHandler = (req: Request, res: Response) => {
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

const PORT = parseInt(process.env.PORT || "5000", 10);
server.listen(PORT, "0.0.0.0", () =>
  console.log(`Server listening on port ${PORT}`)
);