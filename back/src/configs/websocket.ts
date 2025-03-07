// File: ./back/src/configs/websocket.ts
// Last change: Fixed WebSocket type issue by using the correct type import

import WebSocket, { WebSocketServer } from "ws";

export const setupWebSocket = (server: any): InstanceType<typeof WebSocketServer> => {
  const wss = new WebSocketServer({
    server,
    path: "/ws",
    perMessageDeflate: false,
    handleProtocols: () => "echo-protocol",
  });

  wss.on("connection", (ws: InstanceType<typeof WebSocket>) => {
    console.log("Client connected");

    ws.send(JSON.stringify({ message: "Connected!" }));

    ws.on("message", (message: string | Buffer) => {
      console.log("Received:", message.toString());
      ws.send(message.toString());
    });
  });

  return wss;
};