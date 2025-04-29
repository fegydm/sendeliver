// File: back/src/server.ts
import express, { Request, Response, RequestHandler, NextFunction } from "express";
import cors from "cors";
import http from "http";
import path from "path";
import fs from "fs";
import morgan from "morgan";
import * as ua from "express-useragent";
import * as dotenv from "dotenv";

import aiRouter from "./routes/ai.routes.js";
import geoCountriesRouter from "./routes/geo.countries.routes.js";
import geoLanguagesRouter from "./routes/geo.languages.routes.js";
import geoTranslationsRouter from "./routes/geo.translations.routes.js";
import mapsRouter from "./routes/maps.routes.js";
import contactMessagesRoutes from './routes/contact.messages.routes.js';
import vehiclesRouter from "./routes/vehicles.routes.js";
import deliveryRouter from "./routes/delivery.routes.js";
import externalDeliveriesRouter from "./routes/external.deliveries.routes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Raw PINs from environment
const rawPins: Record<string, string> = {
  jozo:   process.env.PIN_JOZO   || "",
  luky:   process.env.PIN_LUKY   || "",
  hauler: process.env.PIN_HAULER || "",
  sender: process.env.PIN_SENDER || ""
};

// Simple cookie parsing helper
const parseCookies = (header?: string): Record<string,string> =>
  header
    ? Object.fromEntries(header.split(";").map(s => {
        const [k,v] = s.split("=");
        return [k.trim(), decodeURIComponent(v||"")];
      }))
    : {};

app.use(express.json());
app.use(ua.express());

// Logging
morgan.token("isBot", (req: Request) => (req as any).useragent.isBot ? "BOT" : "HUMAN");
app.use(morgan(":remote-addr :method :url :status :response-time ms :isBot"));

// CORS
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://sendeliver.com"
    ],
    credentials: true
  })
);

// PIN verification endpoint
app.post(
  "/api/verify-pin",
  (req: Request, res: Response, next: NextFunction) => {
    const { domain, pin } = req.body as { domain?: string; pin?: string };
    const valid = !!domain && pin === rawPins[domain];

    if (valid) {
      res.cookie(`pin_${domain}`, pin, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60_000,
      });
    }

    res.json({ success: valid });
    // nemusíš volať next() – stačí, že nevraciaš žiadnu hodnotu
  }
);
// Middleware factory to protect routes
const requirePinFor = (domain: string): RequestHandler => {
  return (req, res, next) => {
    const cookies = parseCookies(req.headers.cookie);
    if (cookies[`pin_${domain}`] !== rawPins[domain]) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    next();
  };
};

// Static asset directories
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const projectRoot = path.resolve(__dirname, "../..");
const frontendPath = path.join(projectRoot, process.env.FRONTEND_PATH || "");
const publicPath = path.join(projectRoot, process.env.PUBLIC_PATH || "");

[["/pics","pics"],["/flags","flags"],["/animations","animations"]].forEach(
  ([url, dir]) => {
    app.use(url, express.static(path.join(publicPath, dir)));
  }
);
app.use("/assets", express.static(path.join(frontendPath, "assets")));

// API routes
app.use("/api/ai", aiRouter);
app.use("/api/geo/countries", geoCountriesRouter);
app.use("/api/geo/languages", geoLanguagesRouter);
app.use("/api/geo/translations", geoTranslationsRouter);
app.use("/api/maps", mapsRouter);

app.use('/api/contact', contactMessagesRoutes);

app.use("/api/vehicles", vehiclesRouter);
app.use("/api", requirePinFor("hauler"), deliveryRouter);
app.use(
  "/api/external/deliveries",
  requirePinFor("hauler"),
  externalDeliveriesRouter
);
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Serve index.html at root
app.get("/", (_req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// SPA fallback & 404 for API
const spaFallback: RequestHandler = (req, res, next) => {
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
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
});
