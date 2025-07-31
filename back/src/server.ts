// File: back/src/server.ts
// Last change: Adding more basic imports

import express from "express";
import http from "http";
import { fileURLToPath } from "url";
import path from "path";
import { loadEnv } from './utils/env-loader.js';
import { userAgentMiddleware } from './utils/user-agent-parser.js';
import { cookieMiddleware } from './utils/cookie-parser.js';
import { httpLogger } from './utils/http-logger.js';
import type { Request, Response } from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment
loadEnv();

const app = express();
const server = http.createServer(app);

// Basic middleware
app.use(cookieMiddleware);
app.use(userAgentMiddleware);
app.use(httpLogger);

app.use(express.json());

// Only basic routes
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Server is running" });
});

app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

const PORT = parseInt(process.env.PORT || "10001", 10);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Minimal server listening on port ${PORT}`);
});