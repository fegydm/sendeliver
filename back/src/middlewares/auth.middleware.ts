// File: ./back/src/middlewares/auth.middleware.ts
// Last change: Fixed Express module augmentation

import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient, Role } from '@prisma/client';

// Správny spôsob augmentácie Express Request
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

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

// Authenticate JWT from cookie and attach user info to req.user
export const authenticateJWT: RequestHandler = async (req, res, next) => {
  // Najprv skúsiť cookie, potom header pre spätnú kompatibilitu
  let token = req.cookies?.auth;
  
  // Fallback na Authorization header (pre API klientov)
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.slice(7);
  }
  
  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    req.user = {
      userId: user.id,
      role: user.role,
      permissions: user.permissions || []
    };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }
};

// Role-based guard
export const checkRole = (...allowedRoles: Role[]): RequestHandler => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient role' });
      return;
    }
    next();
  };
};

// Permission-based guard
export const checkPermission = (permission: string): RequestHandler => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    if (!req.user.permissions?.includes(permission)) {
      res.status(403).json({ error: 'Insufficient permission' });
      return;
    }
    next();
  };
};