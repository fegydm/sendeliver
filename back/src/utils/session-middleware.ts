// File: back/src/utils/session-middleware.ts
// Last change: Custom session middleware replacing express-session

import { createHash, randomBytes } from 'crypto';

const sessions = new Map<string, any>();

export function sessionMiddleware(req: any, res: any, next: any) {
  const sessionId = req.cookies.sessionId || generateSessionId();
  
  // Get or create session
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {});
  }
  
  req.session = sessions.get(sessionId);
  
  // Set session cookie if new
  if (!req.cookies.sessionId) {
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });
  }
  
  next();
}

function generateSessionId(): string {
  return randomBytes(32).toString('hex');
}
