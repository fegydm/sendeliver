// ./back/server.ts

import express from "express";
import cors from "cors";
import http from "http";
import { WebSocketServer } from "ws";
import path from "path";
import { fileURLToPath } from "url";
import { router as aiRoute } from "./routes/ai.route"; // Correct import for aiRoute

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
// (assuming your WebSocket setup is handled elsewhere)

// API routes
app.use("/api/ai", aiRoute); // Added AI routes

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
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000; // Ensure PORT is a number
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown...
// (keeping your existing shutdown code here)

// Export the server for use in testing or other purposes
export default server;
