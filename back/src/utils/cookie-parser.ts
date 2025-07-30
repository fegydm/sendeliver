// File: back/src/utils/cookie-parser.ts
// Last change: Replace cookie-parser middleware with custom implementation

import { Request, Response, NextFunction } from 'express';

export function parseCookies(cookieHeader?: string): Record<string, string> {
  if (!cookieHeader) return {};
  
  return cookieHeader
    .split(';')
    .reduce((cookies: Record<string, string>, cookie: string) => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) {
        cookies[key] = decodeURIComponent(value);
      }
      return cookies;
    }, {});
}

export function cookieMiddleware(req: Request, res: Response, next: NextFunction) {
  req.cookies = parseCookies(req.headers.cookie);
  next();
}