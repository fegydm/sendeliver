// File: back/src/middlewares/csrf.middleware.ts
// Last change: Final fix for TypeScript type conflicts

import { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'node:crypto';

const CSRF_HEADER_NAME = 'X-CSRF-Token';
export const CSRF_COOKIE_NAME = '__Host-csrf-token';

export function setCsrfCookie(res: Response): string {
  const token = randomBytes(32).toString('hex');
  const isSecure = process.env.NODE_ENV === 'production';
  
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'strict',
    path: '/',
    domain: process.env.COOKIE_DOMAIN || undefined,
  });
  
  return token;
}

export function verifyCsrfToken(req: Request, res: Response, next: NextFunction) {
  const tokenFromHeader = req.headers[CSRF_HEADER_NAME.toLowerCase()];
  const tokenFromCookie = req.cookies[CSRF_COOKIE_NAME];
  
  if (!tokenFromHeader || !tokenFromCookie || tokenFromHeader !== tokenFromCookie) {
    console.warn('[CSRF] Token validation failed.');
    res.status(403).json({ message: 'CSRF token mismatch or missing.' });
    return;
  }
  
  next();
}