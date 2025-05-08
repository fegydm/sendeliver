// File: ./back/src/types/global.d.ts
// Last change: Simplified global type declarations

// Globálne deklarácie
declare module 'express' {
    interface Request {
      user?: any;
    }
  }
  
  // Iné moduly, ktoré sú problematické
  declare module 'ws';
  declare module 'jsonwebtoken';
  declare module 'pg';