import express from "express";
import cors from "cors";
import http from "http";
import { WebSocketServer } from "ws";
import path from "path";
import { fileURLToPath } from "url";
import aiRoute from "./routes/ai.route.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// WebSocket server setup...
// (ponecháme váš existujúci WebSocket kód)

// API routes
app.use("/api/ai", aiRoute); // Pridané AI routes

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Serve static files from React build
const frontendPath = path.join(__dirname, "../front/dist");
app.use(express.static(frontendPath));

// SPA fallback - must be after API routes
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown...
// (ponecháme váš existujúci shutdown kód)

export default server;
