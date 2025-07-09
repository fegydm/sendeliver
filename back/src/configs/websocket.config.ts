// File: back/src/configs/websocket.config.ts
// Last action: Implemented new message handling into the original, working code structure.

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
      
      try {
        const decoded: any = token 
          ? jwt.verify(token, process.env.JWT_SECRET || 'default_secret')
          : { id: 'test-user', role: 'admin' };
        
        this.clients.set(socket, {
          ws: socket,
          userId: decoded.id,
          isAdmin: decoded.role === 'admin'
        });
        
        logger.info(`WebSocket client connected: userId=${decoded.id}, isAdmin=${decoded.role === 'admin'}`);
        
        socket.on('message', (message: any) => {
          let messageStr: string;
          if (Buffer.isBuffer(message)) {
            messageStr = message.toString('utf8');
          } else if (typeof message === 'string') {
            messageStr = message;
          } else {
            messageStr = JSON.stringify(message);
          }
          this.handleMessage(socket, messageStr);
        });
        
        socket.on('close', () => {
          logger.info(`WebSocket client disconnected: userId=${this.clients.get(socket)?.userId}`);
          this.clients.delete(socket);
        });
        
      } catch (error) {
        logger.error('WebSocket authentication error:', error);
        socket.close();
      }
    });
    
    this.isInitialized = true;
    logger.info('WebSocket server initialized');
  }
  
  private static handleMessage(socket: any, message: string): void {
    try {
      const data = JSON.parse(message);
      logger.debug('Received WebSocket message:', data);

      // ZMENA: Rozšírená logika pre rôzne typy správ
      switch (data.type) {
        case 'gps_update':
          // Preposielame ako 'vehicle_moved' všetkým adminom
          this.broadcastToAdmins({ type: 'vehicle_moved', payload: data.payload });
          logger.info(`Broadcasted gps_update for vehicle ${data.payload?.vehicleId}`);
          break;

        case 'send_chat_message':
          // Príprava na chat: pošleme správu konkrétnemu príjemcovi
          const recipientId = data.payload?.recipientId;
          const messagePayload = { type: 'new_chat_message', payload: data.payload };
          this.sendToUser(recipientId, messagePayload);
          logger.info(`Sent chat message to user ${recipientId}`);
          break;
        
        default:
          // Pôvodná logika pre neznáme typy alebo staré formáty
          if (data.type === 'chatMessage' && data.payload) {
             this.broadcastToAdmins(data);
             logger.info(`Broadcasted legacy chatMessage to admins`);
          } else {
             logger.warn('Invalid or unknown message format:', data);
          }
          break;
      }

    } catch (error: unknown) {
      logger.error('Error handling WebSocket message:', error instanceof Error ? error.message : String(error));
    }
  }
  
  public static broadcastToAdmins(message: any): void {
    const messageString = JSON.stringify(message);
    for (const [socket, client] of this.clients.entries()) {
      if (client.isAdmin && socket.readyState === this.WebSocket.OPEN) {
        socket.send(messageString);
      }
    }
  }
  
  public static sendToUser(userId: string, message: any): void {
    const messageString = JSON.stringify(message);
    for (const [socket, client] of this.clients.entries()) {
      if (client.userId === userId && socket.readyState === this.WebSocket.OPEN) {
        socket.send(messageString);
        return; // Nájdené, poslané
      }
    }
  }

  // Ostatné pomocné funkcie zostávajú rovnaké...
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