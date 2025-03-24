// File: src/routes/test.routes.ts
import { Router, Request, Response } from "express";

// Create router
const testRouter = Router();

// Define test routes with proper TypeScript typing
testRouter.get("/hello", (req: Request, res: Response) => {
  try {
    res.json({ message: "Hello from test API" });
  } catch (error) {
    res.status(500).json({ error: "Failed to process request" });
  }
});

testRouter.get("/info", (req: Request, res: Response) => {
  try {
    res.json({ 
      server: "WebSocket Test Server",
      version: "1.0.0",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch server info" });
  }
});

testRouter.post("/echo", (req: Request, res: Response) => {
  try {
    res.json({ 
      message: "Echo response",
      receivedData: req.body,
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to echo request" });
  }
});

testRouter.get("/users/:userId", (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    res.json({ 
      userId,
      username: `user_${userId}`,
      joined: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});

export default testRouter;