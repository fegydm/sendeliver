// File: back/src/middlewares/auth.middleware.ts
// Last change: Fixed TypeScript errors related to 'permissions' property and 'req.user' type conflict with Passport.

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

// Extend the Express.User type for Passport.js to include our custom user properties.
// This merges with the existing Passport.User definition.
declare global {
  namespace Express {
    interface User { // This is the type Passport.js uses for req.user
      userId: number;
      role: UserRole;
      // Add other properties if your JWT payload or database user object has them
    }

    // Also ensure Request type is correctly extended if needed elsewhere,
    // though extending User is usually sufficient for req.user conflicts.
    // interface Request {
    //   user?: User; // If you need to explicitly declare it here
    // }
  }
}

/**
 * Middleware to authenticate JWT token from cookies.
 * Attaches user information (userId, role) to req.user.
 */
export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.auth;

  if (!token) {
    return res.status(401).json({ error: 'Authentication token missing' });
  }

  try {
    // Cast the decoded token directly to the extended Express.User type
    const decoded = jwt.verify(token, JWT_SECRET) as Express.User;
    req.user = { userId: decoded.userId, role: decoded.role }; // Assign directly to req.user
    next();
  } catch (error) {
    console.error('JWT authentication error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Middleware to check if the authenticated user has one of the required roles.
 * Must be used after authenticateJWT.
 * @param allowedRoles - A list of UserRole enums that are permitted to access the route.
 */
export const checkRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied: Insufficient permissions' });
    }

    next();
  };
};
