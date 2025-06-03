// File: back/src/middlewares/auth.middleware.ts
// Last change: Fixed Express types and added proper error handling

import jwt from 'jsonwebtoken';
import { PrismaClient, Role } from '@prisma/client';
import { Request, Response, NextFunction, RequestHandler, Router } from 'express';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

// Helper function for error handling
const handleError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

// Authenticate JWT from cookie and attach user info to req.user
export const authenticateJWT: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
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
    
    if (next) next();
    
  } catch (error) {
    console.error('[Auth] JWT verification failed:', error);
    res.status(401).json({ 
      error: 'Invalid or expired token',
      message: handleError(error)
    });
    return;
  }
};

// Role-based guard
export const checkRole = (...allowedRoles: Role[]) => {
  const handler: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ 
        error: 'Insufficient role',
        required: allowedRoles,
        current: req.user.role
      });
      return;
    }
    
    if (next) next();
  };
  
  return handler;
};

// Permission-based guard
export const checkPermission = (permission: string) => {
  const handler: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    
    if (!req.user.permissions?.includes(permission)) {
      res.status(403).json({ 
        error: 'Insufficient permission',
        required: permission,
        current: req.user.permissions
      });
      return;
    }
    
    if (next) next();
  };
  
  return handler;
};