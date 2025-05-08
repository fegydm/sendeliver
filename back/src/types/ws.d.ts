// File: back/src/types/ws.d.ts
declare module 'ws' {
    export class WebSocket {
      on(event: string, listener: (data: any) => void): void;
      send(data: any): void;
      close(): void;
    }
  
    export class Server {
      constructor(options: any);
      on(event: string, listener: (socket: WebSocket, request: any) => void): void;
    }
  }