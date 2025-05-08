// File: ./back/src/types/express.d.ts
// Last change: Extended Express type declarations with full interface support

import { Role } from '@prisma/client';

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
      [key: string]: string | string[] | undefined;
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
    use: Function;
    get: Function;
    post: Function;
    put: Function;
    delete: Function;
    patch: Function;
  }

  export function Router(): Router;
  export function json(options?: any): any;
  export function urlencoded(options?: any): any;
  export function static(root: string, options?: any): any;
  
  export type RequestHandler = (req: Request, res: Response, next?: NextFunction) => any;

  export interface Application {
    use(middleware: any): Application;
    use(path: string, middleware: any): Application;
    get(path: string, ...handlers: any[]): Application;
    post(path: string, ...handlers: any[]): Application;
    put(path: string, ...handlers: any[]): Application;
    delete(path: string, ...handlers: any[]): Application;
    patch(path: string, ...handlers: any[]): Application;
    listen(port: number, callback?: () => void): any;
    listen(port: number, hostname: string, callback?: () => void): any;
  }
  
  function express(): Application;
  export default express;
  
  namespace express {
    export function json(options?: any): any;
    export function urlencoded(options?: any): any;
    export function static(root: string, options?: any): any;
    export function Router(): Router;
  }
}

export {};