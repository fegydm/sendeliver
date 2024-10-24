// ./back/config/websocket.js
import { WebSocketServer } from 'ws';
import { handleMessage } from '../services/wsService.js';

export const setupWebSocket = (server) => {
  console.log('Setting up WebSocket server...');
  
  const wss = new WebSocketServer({ 
    server,
    clientTracking: true,
    handleProtocols: () => 'echo-protocol'  // pridané
  });
  
  // Debugging events
  wss.on('headers', (headers) => {
    console.log('WebSocket Headers:', headers);
  });

  wss.on('error', (error) => {
    console.error('WebSocket Server Error:', error);
  });
  
  wss.on('connection', (ws, req) => {
    console.log('Client trying to connect from:', req.socket.remoteAddress);
    console.log('Headers:', req.headers);
    
    ws.isAlive = true;

    ws.on('pong', () => {
      console.log('Received pong');
      ws.isAlive = true;
    });

    ws.on('message', (data) => {
      console.log('Received message:', data.toString());
      handleMessage(ws, data);
    });

    ws.on('close', (code, reason) => {
      console.log('Client disconnected with code:', code, 'reason:', reason);
      ws.isAlive = false;
    });

    ws.on('error', (error) => {
      console.error('Client WebSocket error:', error);
    });

    try {
      ws.send(JSON.stringify({ type: 'connection', status: 'connected' }));
      console.log('Sent connection confirmation');
    } catch (error) {
      console.error('Error sending confirmation:', error);
    }
  });

  return wss;
};