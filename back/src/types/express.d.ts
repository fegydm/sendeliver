// File: ./back/src/types/express.d.ts
// Last change: Extended Express type declarations with full interface support

import { Role } from '@prisma/client';

declare global {
 namespace Express {
   interface Request {
     user?: {
       userId: number;
       role: Role;
       permissions: string[];
     };
     body: any;
     query: any;
     params: any;
     path: string;
     cookies: { [key: string]: string };
     headers: {
       [key: string]: string | string[] | undefined;
       authorization?: string;
     };
   }
   
   interface Response {
     status(code: number): Response;
     json(data: any): Response;
     send(body?: any): Response;
     sendFile(path: string, options?: any): void;
     sendStatus(code: number): Response;
     cookie(name: string, value: string, options?: any): Response;
     clearCookie(name: string, options?: any): Response;
     set(field: string, value: string): Response;
     setHeader(name: string, value: string): Response;
     end(): Response;
   }
 }
}

// Export prázdneho objektu, aby TypeScript považoval tento súbor za modul
export {};