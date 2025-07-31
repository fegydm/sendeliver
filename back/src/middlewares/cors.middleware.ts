// File: back/src/middlewares/cors.middleware.ts
// Last change: Centralized and improved the custom CORS middleware.

import { Request, Response, NextFunction } from 'express';

const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3001",
  "http://localhost:5173",
  "https://sendeliver.com"
];

export const customCorsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
};
