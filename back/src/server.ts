// ./back/src/server.ts
import express, { Request, Response } from "express";
import cors from "cors";
import http from "http";
import { WebSocket, WebSocketServer } from "ws";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import dotenv from "dotenv";
import { router as aiRouter } from "./routes/ai.routes";
import themesRouter from "./routes/themes.routes";

dotenv.config(); // Load environment variables from .env file

// Types
interface ExtendedWebSocket extends WebSocket {
  isAlive: boolean;
}

// Path initialization
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../..");
const frontendPath = process.env.FRONTEND_PATH
  ? path.join(projectRoot, process.env.FRONTEND_PATH)
  : path.join(projectRoot, "front/dist");
const publicPath = process.env.PUBLIC_PATH
  ? path.join(projectRoot, process.env.PUBLIC_PATH)
  : path.join(projectRoot, "front/public");

console.log("Project paths:");
console.log("__dirname:", __dirname);
console.log("projectRoot:", projectRoot);
console.log("frontendPath:", frontendPath);
console.log("publicPath:", publicPath);

// App initialization
const app = express();
const server = http.createServer(app);

// Middleware setup
app.use((req: Request, _res: Response, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
app.use(cors());
app.use(express.json());

// Static files configuration
app.use(express.static(frontendPath));
app.use(express.static(publicPath));

// Specific static paths
app.use("/pics", express.static(path.join(publicPath, "pics")));
app.use("/flags", express.static(path.join(publicPath, "flags")));
app.use("/animations", express.static(path.join(publicPath, "animations")));
app.use("/assets", express.static(path.join(frontendPath, "assets")));

// WebSocket setup
const wss = new WebSocketServer({ server });

const setupWebSocket = (ws: ExtendedWebSocket) => {
  console.log("New WebSocket connection");
  ws.isAlive = true;

  ws.on("pong", () => {
    ws.isAlive = true;
  });

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString());
      switch (data.type) {
        case "ping":
          ws.send(JSON.stringify({ type: "pong", timestamp: Date.now() }));
          break;
        default:
          console.log("Unhandled message type:", data.type);
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
};

wss.on("connection", setupWebSocket);

// WebSocket heartbeat
const heartbeatInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    const extWs = ws as ExtendedWebSocket;
    if (!extWs.isAlive) return extWs.terminate();
    extWs.isAlive = false;
    extWs.ping();
  });
}, 30000);

wss.on("close", () => {
  clearInterval(heartbeatInterval);
});

// API Routes
app.use("/api/ai", aiRouter);
app.use("/api/themes", themesRouter);

// Health check route
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// SPA fallback - must be after API routes
app.get("*", (req: Request, res: Response) => {
  if (!req.url.startsWith("/api")) {
    res.sendFile(path.join(frontendPath, "index.html"));
  }
});

// Server startup
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

const startServer = () => {
  // Check directory existence
  try {
    if (!fs.existsSync(frontendPath)) {
      console.warn(
        `Warning: Frontend dist directory not found at ${frontendPath}`
      );
      const parentDir = path.dirname(frontendPath);
      if (fs.existsSync(parentDir)) {
        console.log("Parent directory contents:", fs.readdirSync(parentDir));
      }
    }
    if (!fs.existsSync(publicPath)) {
      console.warn(
        `Warning: Frontend public directory not found at ${publicPath}`
      );
    }

    server
      .listen(
        {
          port: PORT,
          host: "0.0.0.0",
        },
        () => {
          console.log(`Server running on port ${PORT}`);
          console.log("Static files directories:");
          console.log(` - ${frontendPath} (dist)`);
          console.log(` - ${publicPath} (public)`);
        }
      )
      .on("error", (error) => {
        console.error("Failed to start server:", error);
        if ((error as NodeJS.ErrnoException).code === "EADDRINUSE") {
          console.error(`Port ${PORT} is already in use`);
        }
      });
  } catch (error) {
    console.error("Failed to start server due to file system error:", error);
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

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Closing server...");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

startServer();
export default server;
