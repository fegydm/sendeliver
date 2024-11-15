import { WebSocketServer } from "ws";

export const setupWebSocket = (server: any): WebSocketServer => {
  const wss = new WebSocketServer({
    server,
    path: "/ws",
    perMessageDeflate: false,
    handleProtocols: () => "echo-protocol",
  });

  wss.on("connection", (ws) => {
    console.log("Client connected");

    ws.send(JSON.stringify({ message: "Connected!" }));

    ws.on("message", (message: string | Buffer) => {
      // Úprava tu, aby sme použili správny typ
      console.log("Received:", message.toString());
      ws.send(message.toString()); // Echo back
    });
  });

  return wss;
};
