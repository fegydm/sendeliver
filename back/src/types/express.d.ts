// File: back/src/types/express.d.ts
// Last change: Global Express type extensions

import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
      useragent?: {
        isBoten?: boolean;
        isBot?: boolean;
        browser?: string;
        version?: string;
        os?: string;
        platform?: string;
        source?: string;
      };
    }
  }
}

export {};