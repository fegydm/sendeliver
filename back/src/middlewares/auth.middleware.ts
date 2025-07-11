// File: back/src/middlewares/auth.middleware.ts
// Last change: Fixed TypeScript errors related to 'permissions' property.

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient, UserRole } from '@prisma/client'; // Corrected Role to UserRole

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

// Extend the Request type to include a 'user' property
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        role: UserRole; // Use UserRole here
        // If you decide to add permissions to the User model,
        // you would add them here and ensure the JWT token includes them.
        // permissions?: string[];
      };
    }
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
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; role: UserRole }; // Cast to include UserRole
    req.user = { userId: decoded.userId, role: decoded.role };
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
      // This should ideally not happen if authenticateJWT runs first, but as a safeguard
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if the user's role is included in the allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied: Insufficient permissions' });
    }

    // If permissions were to be stored on the user model and used for fine-grained access,
    // you would fetch the user from DB here and check their permissions.
    // Example (if 'permissions' were in Prisma User model):
    // const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    // if (!user || !user.permissions.some(p => requiredPermissions.includes(p))) {
    //   return res.status(403).json({ error: 'Access denied: Insufficient permissions' });
    // }

    // No 'permissions' property exists on the User model in the current Prisma schema.
    // Therefore, any code attempting to access 'user.permissions' directly from the Prisma
    // User object (as returned by findUnique/findMany) or from the JWT payload
    // will result in a TypeScript error.
    // The provided error message "Property 'permissions' does not exist on type '{ ... }'"
    // confirms this. We are removing the problematic line.
    // permissions: user.permissions || [] // This line was causing the error.

    next();
  };
};

// You might export the prisma client if other parts of your middleware need it,
// but typically it's better to pass it or create a new instance where needed.
// export const prismaClient = prisma;
