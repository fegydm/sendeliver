// File: ./back/src/configs/websocket.ts
// Last change: Implementation of WebSocket server for real-time notifications

import WebSocket, { WebSocketServer as WSServer } from 'ws';
import { Server } from 'http';
import { logger } from '@sendeliver/logger';
import jwt from 'jsonwebtoken';

interface AdminClient {
  ws: WebSocket;
  userId: string;
  isAdmin: boolean;
}

export class WebSocketServer {
  private static wss: WSServer;
  private static clients: Map<WebSocket, AdminClient> = new Map();
  
  public static initialize(server: Server): void {
    this.wss = new WSServer({ server, path: '/ws' });
    
    this.wss.on('connection', (ws: WebSocket, request) => {
      // Extract token from query parameter
      const url = new URL(request.url || '', `http://${request.headers.host}`);
      const token = url.searchParams.get('token');
      
      if (!token) {
        ws.close(1008, 'Authentication required');
        return;
      }
      
      try {
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as any;
        
        // Register the client
        this.clients.set(ws, {
          ws,
          userId: decoded.id,
          isAdmin: decoded.role === 'admin'
        });
        
        logger.info(`WebSocket client connected: userId=${decoded.id}, isAdmin=${decoded.role === 'admin'}`);
        
        // Send welcome message
        ws.send(JSON.stringify({
          type: 'connection',
          payload: { status: 'connected', timestamp: new Date().toISOString() }
        }));
        
        // Set up event handlers
        ws.on('message', (message: string) => {
          this.handleMessage(ws, message);
        });
        
        ws.on('close', () => {
          this.clients.delete(ws);
          logger.info(`WebSocket client disconnected: userId=${decoded.id}`);
        });
        
      } catch (error) {
        logger.error('WebSocket authentication error:', error);
        ws.close(1008, 'Authentication failed');
      }
    });
    
    logger.info('WebSocket server initialized');
  }
  
  private static handleMessage(ws: WebSocket, message: string): void {
    try {
      const data = JSON.parse(message);
      // Handle different message types here
      logger.debug('Received WebSocket message:', data);
    } catch (error) {
      logger.error('Error handling WebSocket message:', error);
    }
  }
  
  /**
   * Broadcast a message to all connected admin clients
   */
  public static broadcastToAdmins(message: any): void {
    for (const [ws, client] of this.clients.entries()) {
      if (client.isAdmin && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    }
  }
  
  /**
   * Send a message to a specific user
   */
  public static sendToUser(userId: string, message: any): void {
    for (const [ws, client] of this.clients.entries()) {
      if (client.userId === userId && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    }
  }
}