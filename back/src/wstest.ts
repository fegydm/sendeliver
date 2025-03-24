// File: back/src/wstest.ts
import * as ws from "ws";
import * as http from "http";

interface WebSocket {
  on(event: string, callback: (...args: any[]) => void): void;
  send(data: string): void;
  ping(): void;
  terminate(): void;
  close(): void;
}

interface ExtendedWebSocket extends WebSocket {
  isAlive: boolean;
}

const server = http.createServer();
const wss = new ws.Server({ server });
wss.on("connection", (ws: ExtendedWebSocket) => {
  ws.isAlive = true;
  ws.on("pong", () => {
    ws.isAlive = true;
  });
});