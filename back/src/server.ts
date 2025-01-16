import express, { Request, Response } from "express";
import cors from "cors";
import http from "http";
import { WebSocket, WebSocketServer } from "ws";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import dotenv from "dotenv";
import aiRouter from "./routes/ai.routes.js";
import deliveryRouter from "./routes/delivery.routes.js";

dotenv.config();

// Extended WebSocket Interface
interface ExtendedWebSocket extends WebSocket {
  isAlive: boolean;
}

// File and directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../..");
const frontendPath = process.env.FRONTEND_PATH
  ? path.join(projectRoot, process.env.FRONTEND_PATH)
  : path.join(projectRoot, "front/dist");
const publicPath = process.env.PUBLIC_PATH
  ? path.join(projectRoot, process.env.PUBLIC_PATH)
  : path.join(projectRoot, "front/public");

// Express app and server
const app = express();
const server = http.createServer(app);

// Middleware for logging in development
app.use((req: Request, _res: Response, next) => {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }
  next();
});

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://sendeliver.com",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept-Language"],
  })
);

// Body parsing and static file serving
app.use(express.json());
app.use(express.static(frontendPath));
app.use(express.static(publicPath));

// Static routes for specific directories
const staticRoutes = [
  { url: "/pics", path: path.join(publicPath, "pics") },
  { url: "/flags", path: path.join(publicPath, "flags") },
  { url: "/animations", path: path.join(publicPath, "animations") },
  { url: "/assets", path: path.join(frontendPath, "assets") },
];
staticRoutes.forEach((route) =>
  app.use(route.url, express.static(route.path))
);

// Logging middleware for animation requests
app.use("/animation", (req, res, next) => {
  console.log(`Request received for animation: ${req.method} ${req.url}`);
  next();
});

// API route for animations
app.get("/api/animations", (_req: Request, res: Response) => {
  const animationsDir = path.join(publicPath, "animations");

  fs.readdir(animationsDir, (err, files) => {
    if (err) {
      console.error("Error reading animations directory:", err);
      res.status(500).json({ error: "Failed to load animations." });
    } else {
      console.log("Available animations:", files);
      const animations = files.filter(
        (file) => file.endsWith(".json") || file.endsWith(".svg")
      );
      console.log("Filtered animations:", animations);
      res.json(animations);
    }
  });
});

// WebSocket setup
const wss = new WebSocketServer({ server });
const setupWebSocket = (ws: ExtendedWebSocket) => {
  ws.isAlive = true;

  ws.on("pong", () => {
    ws.isAlive = true;
  });

  ws.on("message", (message: string) => {
    try {
      const data = JSON.parse(message);
      if (data.type === "ping") {
        ws.send(JSON.stringify({ type: "pong", timestamp: Date.now() }));
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  ws.on("error", (error: Error) => {
    console.error("WebSocket error:", error);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
};

// WebSocket connection and heartbeat
wss.on("connection", setupWebSocket);
const heartbeatInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    const extWs = ws as ExtendedWebSocket;
    if (!extWs.isAlive) return extWs.terminate();
    extWs.isAlive = false;
    extWs.ping();
  });
}, 30000);

// Cleanup interval on WebSocket close
wss.on("close", () => {
  clearInterval(heartbeatInterval);
});

// API routes
app.use("/api/ai", aiRouter);
app.use("/api", deliveryRouter);

// Health check route
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// Catch-all route for SPA
app.get("*", (req: Request, res: Response) => {
  if (!req.url.startsWith("/api")) {
    res.sendFile(path.join(frontendPath, "index.html"));
  }
});

// Server setup
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
const startServer = () => {
  try {
    // Check paths
    if (!fs.existsSync(frontendPath)) {
      console.warn(`Warning: Frontend dist directory not found at ${frontendPath}`);
    }
    if (!fs.existsSync(publicPath)) {
      console.warn(`Warning: Frontend public directory not found at ${publicPath}`);
    }

    server.listen({ port: PORT, host: "0.0.0.0" }, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server due to error:", error);
    process.exit(1);
  }
};

// Error handling
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("SIGTERM", () => {
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

// Start server
startServer();

// Debug logging for development
if (process.env.NODE_ENV !== "production") {
  console.log("Debug log:", process.env.DELIVERY_API_URL);
}

export default server;
