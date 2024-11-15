// ./back/services/ws.service.ts
import { WebSocket } from "ws";

// Function to handle incoming WebSocket messages
export const handleMessage = async (
  ws: WebSocket,
  data: any
): Promise<void> => {
  try {
    console.log("Processing message:", data.toString());

    // Simple echo server for testing
    ws.send(
      JSON.stringify({
        type: "echo",
        data: data.toString(),
      })
    );
  } catch (err: any) {
    console.error("Error in handleMessage:", err);
    ws.send(
      JSON.stringify({
        type: "error",
        message: err.message,
      })
    );
  }
};
