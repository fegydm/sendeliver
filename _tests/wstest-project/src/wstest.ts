// File: src/wstest.ts
import WebSocket, { WebSocketServer } from "ws";
import * as http from "http";

// Define the extended WebSocket interface with our custom property
interface ExtendedWebSocket extends WebSocket {
  isAlive: boolean;
}

// Create HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("WebSocket Test Server");
});

// Create WebSocket server
const wss = new WebSocketServer({ server });
const heartbeatInterval = 30000;

// Handle connections
wss.on("connection", (ws: WebSocket) => {
  console.log("Client connected");
  
  // Cast to our extended type
  const extWs = ws as ExtendedWebSocket;
  extWs.isAlive = true;
  
  // Set up event handlers
  ws.on("pong", () => {
    console.log("Received pong");
    (ws as ExtendedWebSocket).isAlive = true;
  });
  
  ws.on("message", (message: Buffer | string) => {
    try {
      console.log("Received message:", message.toString());
      const data = JSON.parse(message.toString());
      
      if (data.type === "ping") {
        console.log("Sending pong response");
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
  
  // Send welcome message
  ws.send(JSON.stringify({ type: "welcome", message: "Connected to WebSocket server" }));
});

// Set up heartbeat mechanism
const interval = setInterval(() => {
  console.log("Checking heartbeats");
  wss.clients.forEach((ws: WebSocket) => {
    const extWs = ws as ExtendedWebSocket;
    
    if (!extWs.isAlive) {
      console.log("Terminating inactive client");
      return ws.terminate();
    }
    
    extWs.isAlive = false;
    console.log("Sending ping");
    ws.ping();
  });
}, heartbeatInterval);

// Clean up on server close
wss.on("close", () => {
  clearInterval(interval);
  console.log("WebSocket server closed");
});

// Start the server
const PORT = 8080;
server.listen(PORT, () => {
  console.log(`WebSocket server is running on port ${PORT}`);
});

// Handle process termination
process.on("SIGINT", () => {
  console.log("Shutting down server");
  wss.close();
  server.close();
  process.exit(0);
});