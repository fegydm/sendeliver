// File: back/src/middlewares/auth.middleware.ts
// Last change: Fixed implicit 'any' type for 'membership' parameter.

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient, UserRole, UserType } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

// Extend Express.User type to include our custom user properties.
declare global {
  namespace Express {
    interface User {
      userId: number;
      userType: UserType;
      primaryRole: UserRole; // User's primary role
      // Array of active memberships: { organizationId, role }
      memberships: { organizationId: number; role: UserRole }[]; 
      // activeOrganizationId?: number; // Future: to store currently selected organization context
      // activeRoleInOrg?: UserRole; // Future: to store currently selected role in organization
    }
  }
}

/**
 * Middleware to authenticate JWT token from cookies.
 * Attaches user information (userId, userType, primaryRole, memberships) to req.user.
 */
export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.auth;

  if (!token) {
    return res.status(401).json({ error: 'Authentication token missing' });
  }

  try {
    // Cast decoded token to the extended Express.User type.
    const decoded = jwt.verify(token, JWT_SECRET) as Express.User;
    
    // Assign properties from the decoded token to req.user.
    req.user = { 
      userId: decoded.userId, 
      userType: decoded.userType,
      primaryRole: decoded.primaryRole, // Assign primary role
      memberships: decoded.memberships // Assign all memberships
    };
    next();
  } catch (error) {
    console.error('JWT authentication error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Middleware to check if the authenticated user has one of the required roles.
 * This checks against the user's primaryRole OR any of their active membership roles.
 * @param allowedRoles - A list of UserRole enums that are permitted to access the route.
 */
export const checkRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check if primaryRole is allowed.
    if (allowedRoles.includes(req.user.primaryRole)) {
      return next();
    }

    // Check if any of the user's active membership roles are allowed.
    // Explicitly type 'membership' parameter.
    const hasMembershipRole = req.user.memberships.some((membership: { organizationId: number; role: UserRole }) => 
      allowedRoles.includes(membership.role)
    );

    if (hasMembershipRole) {
      return next();
    }

    // If neither primary role nor any membership role is allowed.
    return res.status(403).json({ error: 'Access denied: Insufficient permissions' });
  };
};
