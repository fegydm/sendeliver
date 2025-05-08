// File: ./back/src/types/express.d.ts
// Last change: Fixed type declarations for Express Request with Prisma Role

import { Role } from '@prisma/client';

// Upravený súbor s deklaráciami pre Express
declare global {
 namespace Express {
   interface Request {
     user?: {
       userId: number;
       role: Role;
       permissions: string[];
     };
   }
 }
}

// Export prázdneho objektu, aby TypeScript považoval tento súbor za modul
export {};