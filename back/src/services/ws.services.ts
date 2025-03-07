// File: ./back/services/ws.service.ts
// Last change: Fixed WebSocket type using InstanceType

import WebSocket from "ws";

// Function to handle incoming WebSocket messages
export const handleMessage = async (
  ws: InstanceType<typeof WebSocket>,
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