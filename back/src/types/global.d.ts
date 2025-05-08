// File: back/src/types/global.d.ts
import { Role } from '@prisma/client';

// Express definitions
declare module 'express' {
  export interface Request {
    body: any;
    query: any;
    params: any;
    path: string;
    cookies: {
      [key: string]: string;
    };
    headers: {
      [key: string]: string | undefined;
      authorization?: string;
    };
    user?: {
      userId: number;
      role: Role;
      permissions: string[];
    };
  }

  export interface Response {
    status(code: number): Response;
    json(data: any): Response;
    send(body?: any): Response;
    end(): Response;
    sendStatus(code: number): Response;
    sendFile(path: string, options?: any): void;
    cookie(name: string, value: string, options?: any): Response;
    clearCookie(name: string, options?: any): Response;
    set(field: string, value: string): Response;
    setHeader(name: string, value: string): Response;
  }

  export interface NextFunction {
    (err?: any): void;
  }

  export interface Router {
    get(path: string, ...handlers: any[]): Router;
    post(path: string, ...handlers: any[]): Router;
    put(path: string, ...handlers: any[]): Router;
    delete(path: string, ...handlers: any[]): Router;
    patch(path: string, ...handlers: any[]): Router;
    use(...handlers: any[]): Router;
    use(path: string, ...handlers: any[]): Router;
  }

  export function Router(): Router;
  export function json(): any;
  export function static(root: string, options?: any): any;

  // Express factory function
  function express(): Express.Application;
  namespace express {
    export interface Application {
      use(middleware: any): Application;
      use(path: string, middleware: any): Application;
      get(path: string, ...handlers: any[]): Application;
      post(path: string, ...handlers: any[]): Application;
      put(path: string, ...handlers: any[]): Application;
      delete(path: string, ...handlers: any[]): Application;
      patch(path: string, ...handlers: any[]): Application;
      listen(port: number, callback?: () => void): Application;
    }
  }
  export = express;
}

// WebSocket definitions
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

// Other modules
declare module 'cors' {
  function cors(options?: any): any;
  export = cors;
}

declare module 'nodemailer' {
  function createTransport(options: any): any;
  export = { createTransport };
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      userId: number;
      role: Role;
      permissions: string[];
    };
  }
}