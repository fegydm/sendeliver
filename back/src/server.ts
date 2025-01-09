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

interface ExtendedWebSocket extends WebSocket {
  isAlive: boolean;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../..");
const frontendPath = process.env.FRONTEND_PATH
  ? path.join(projectRoot, process.env.FRONTEND_PATH)
  : path.join(projectRoot, "front/dist");
const publicPath = process.env.PUBLIC_PATH
  ? path.join(projectRoot, process.env.PUBLIC_PATH)
  : path.join(projectRoot, "front/public");

const app = express();
const server = http.createServer(app);

app.use((req: Request, _res: Response, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`${req.method} ${req.url}`);
  }
  next();
});

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'https://sendeliver.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language']
}));

app.use(express.json());
app.use(express.static(frontendPath));
app.use(express.static(publicPath));

app.use("/pics", express.static(path.join(publicPath, "pics")));
app.use("/flags", express.static(path.join(publicPath, "flags")));
app.use("/animations", express.static(path.join(publicPath, "animations")));
app.use("/assets", express.static(path.join(frontendPath, "assets")));

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

wss.on("connection", setupWebSocket);

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

app.use("/api/ai", aiRouter);
app.use("/api", deliveryRouter);

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.get("*", (req: Request, res: Response) => {
  if (!req.url.startsWith("/api")) {
    res.sendFile(path.join(frontendPath, "index.html"));
  }
});

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

const startServer = () => {
  try {
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

startServer();

if (process.env.NODE_ENV !== 'production') {
  console.log("Debug log:", process.env.DELIVERY_API_URL);
}

export default server;
