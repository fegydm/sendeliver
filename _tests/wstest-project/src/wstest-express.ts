// File: src/wstest-express.ts
import express, { Request, Response, Router } from "express";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import cors from "cors";

// Define the extended WebSocket interface
interface ExtendedWebSocket extends WebSocket {
  isAlive: boolean;
}

// Create Express application
const app = express();
const server = http.createServer(app);

// Set up middleware
app.use(express.json());
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173", "http://localhost:8080"],
  credentials: true
}));

// Create test router
const testRouter = Router();

// Define test routes
testRouter.get("/hello", (req: Request, res: Response) => {
  res.json({ message: "Hello from test API" });
});

testRouter.get("/info", (req: Request, res: Response) => {
  res.json({ 
    server: "WebSocket Test Server",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

testRouter.post("/echo", (req: Request, res: Response) => {
  res.json({ 
    message: "Echo response",
    receivedData: req.body,
    timestamp: Date.now()
  });
});

testRouter.get("/users/:userId", (req: Request, res: Response) => {
  const { userId } = req.params;
  res.json({ 
    userId,
    username: `user_${userId}`,
    joined: new Date().toISOString()
  });
});

// Mount the router
app.use("/api/test", testRouter);

// Add a health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// SPA fallback (serve index.html for any undefined route)
app.get("*", (_req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>WebSocket Test Server</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #333; }
          pre { background: #f4f4f4; padding: 10px; border-radius: 5px; }
          .endpoint { margin-bottom: 20px; }
          .method { font-weight: bold; display: inline-block; width: 80px; }
          .url { color: #0066cc; }
        </style>
      </head>
      <body>
        <h1>WebSocket Test Server</h1>
        <p>Server is running. Available endpoints:</p>
        
        <div class="endpoint">
          <span class="method">GET</span>
          <span class="url">/api/test/hello</span>
          <p>Simple hello response</p>
        </div>
        
        <div class="endpoint">
          <span class="method">GET</span>
          <span class="url">/api/test/info</span>
          <p>Server information</p>
        </div>
        
        <div class="endpoint">
          <span class="method">POST</span>
          <span class="url">/api/test/echo</span>
          <p>Echoes back the request body</p>
        </div>
        
        <div class="endpoint">
          <span class="method">GET</span>
          <span class="url">/api/test/users/:userId</span>
          <p>Returns mock user information</p>
        </div>
        
        <div class="endpoint">
          <span class="method">GET</span>
          <span class="url">/api/health</span>
          <p>Health check endpoint</p>
        </div>
        
        <h2>WebSocket</h2>
        <p>WebSocket server is available at:</p>
        <pre>ws://localhost:8080</pre>
      </body>
    </html>
  `);
});

// Set up WebSocket server
const wss = new WebSocketServer({ server });
const heartbeatInterval = 30000;

// Handle WebSocket connections
wss.on("connection", (ws: WebSocket) => {
  console.log("Client connected");
  
  // Cast to our extended type
  const extWs = ws as ExtendedWebSocket;
  extWs.isAlive = true;
  
  // Set up event handlers
  ws.on("pong", () => {
    (ws as ExtendedWebSocket).isAlive = true;
  });
  
  ws.on("message", (message: Buffer | string) => {
    try {
      console.log("Received message:", message.toString());
      const data = JSON.parse(message.toString());
      
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
  
  // Send welcome message
  ws.send(JSON.stringify({ type: "welcome", message: "Connected to WebSocket server" }));
});

// Set up heartbeat mechanism
const interval = setInterval(() => {
  wss.clients.forEach((ws: WebSocket) => {
    const extWs = ws as ExtendedWebSocket;
    
    if (!extWs.isAlive) {
      return ws.terminate();
    }
    
    extWs.isAlive = false;
    ws.ping();
  });
}, heartbeatInterval);

// Clean up on server close
wss.on("close", () => {
  clearInterval(interval);
});

// Start the server
const PORT = 8080;
server.listen(PORT, () => {
  console.log(`WebSocket and Express server is running on port ${PORT}`);
  console.log(`- HTTP endpoints available at http://localhost:${PORT}/api/test/`);
  console.log(`- WebSocket server available at ws://localhost:${PORT}`);
});

// Handle process termination
process.on("SIGINT", () => {
  console.log("Shutting down server");
  wss.close();
  server.close();
  process.exit(0);
});
