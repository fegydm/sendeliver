// File: ./back/src/configs/websocket.config.ts
// Last change: Fixed message handling to properly convert Buffer to string

import { Server as HttpServer } from 'http';
import { logger } from '@sendeliver/logger';
import jwt from 'jsonwebtoken';

interface AdminClient {
  ws: any;
  userId: string;
  isAdmin: boolean;
}

export class WebSocketManager {
  private static wss: any;
  private static clients: Map<any, AdminClient> = new Map();
  private static WebSocket: any;
  private static isInitialized = false;
  
  public static initialize(server: HttpServer): void {
    this.initializeAsync(server).catch(error => {
      logger.error('Failed to initialize WebSocket server:', error);
    });
  }
  
  private static async initializeAsync(server: HttpServer): Promise<void> {
    const wsModule = await import('ws');
    this.WebSocket = wsModule.default;
    const { WebSocketServer } = wsModule;
    
    this.wss = new WebSocketServer({ server, path: '/ws' });
    
    this.wss.on('connection', (socket: any, request: any) => {
      const url = new URL(request.url || '', `http://${request.headers.host}`);
      const token = url.searchParams.get('token');
      
      if (!token) {
        logger.warn('WebSocket connection without token - using test user');
      }
      
      try {
        let decoded = token 
          ? jwt.verify(token, process.env.JWT_SECRET || 'default_secret')
          : { id: 'test-user', role: 'admin' };
        
        this.clients.set(socket, {
          ws: socket,
          userId: decoded.id,
          isAdmin: decoded.role === 'admin'
        });
        
        logger.info(`WebSocket client connected: userId=${decoded.id}, isAdmin=${decoded.role === 'admin'}`);
        
        socket.send(JSON.stringify({
          type: 'connection',
          payload: { status: 'connected', timestamp: new Date().toISOString() }
        }));
        
        socket.on('message', (message: any) => {
          let messageStr: string;
          
          // Handle different message types
          if (Buffer.isBuffer(message)) {
            messageStr = message.toString('utf8');
          } else if (typeof message === 'string') {
            messageStr = message;
          } else if (typeof message === 'object') {
            // If message is already parsed object, stringify it first
            messageStr = JSON.stringify(message);
          } else {
            logger.warn('Unknown message type received:', typeof message, message);
            return;
          }
          
          this.handleMessage(socket, messageStr);
        });
        
        socket.on('close', () => {
          this.clients.delete(socket);
          logger.info(`WebSocket client disconnected: userId=${decoded.id}`);
        });
        
      } catch (error) {
        logger.error('WebSocket authentication error:', error);
        socket.close(1008, 'Authentication failed');
      }
    });
    
    this.isInitialized = true;
    logger.info('WebSocket server initialized');
  }
  
  private static handleMessage(socket: any, message: string): void {
    try {
      if (!message || typeof message !== 'string') {
        logger.warn('Invalid message received:', typeof message, message);
        return;
      }
      
      const data = JSON.parse(message);
      logger.debug('Received WebSocket message:', data);

      if (data.type === 'chatMessage' && data.payload && data.payload.messageId && data.payload.message) {
        // Echo back to sender
        socket.send(JSON.stringify(data));
        logger.info(`Echoed chatMessage to client: ${data.payload.messageId}`);
        
        // Broadcast to all admins
        this.broadcastToAdmins(data);
        logger.info(`Broadcasted chatMessage to admins: ${data.payload.messageId}`);
      } else {
        logger.warn('Invalid message format:', data);
      }
    } catch (error: unknown) {
      logger.error('Error handling WebSocket message:', error instanceof Error ? error.message : String(error));
    }
  }
  
  public static broadcastToAdmins(message: any): void {
    let sentCount = 0;
    for (const [socket, client] of this.clients.entries()) {
      if (client.isAdmin && socket.readyState === 1) {
        socket.send(JSON.stringify(message));
        sentCount++;
      }
    }
    logger.info(`Broadcasted message to ${sentCount} admin clients`);
  }
  
  public static sendToUser(userId: string, message: any): void {
    for (const [socket, client] of this.clients.entries()) {
      if (client.userId === userId && socket.readyState === 1) {
        socket.send(JSON.stringify(message));
      }
    }
  }
  
  public static getConnectedClients(): number {
    return this.clients.size;
  }
  
  public static getAdminClients(): number {
    let adminCount = 0;
    for (const [, client] of this.clients.entries()) {
      if (client.isAdmin) adminCount++;
    }
    return adminCount;
  }
}