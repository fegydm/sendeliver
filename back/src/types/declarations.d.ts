// File: ./back/src/types/declarations.d.ts
declare module 'express' {
    export interface Request {
      user?: any;
    }
    
    export interface Response {
      status(code: number): Response;
      json(data: any): void;
      cookie(name: string, val: string, options: any): void;
      clearCookie(name: string, options?: any): void;
      end(): void;
    }
    
    export interface NextFunction {
      (err?: any): void;
    }
    
    export interface RequestHandler {
      (req: Request, res: Response, next: NextFunction): Promise<void> | void;
    }
  }
  
  declare module 'pg';
  declare module 'ws'; 
  declare module 'jsonwebtoken';
  declare module 'cookie-parser';
  declare module 'express-useragent';
  declare module 'ioredis';
  declare module 'morgan';
  declare module 'redis';