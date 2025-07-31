// File: back/src/middlewares/auth.middleware.ts
// Last change: Added the missing 'email' property to the req.user object.

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient, UserRole, UserType } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.auth;

  if (!token) {
    return res.status(401).json({ error: 'Authentication token missing' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as Express.User;
    
    req.user = { 
      userId: decoded.userId, 
      email: decoded.email,
      userType: decoded.userType,
      primaryRole: decoded.primaryRole,
      memberships: decoded.memberships
    };
    next();
  } catch (error) {
    console.error('JWT authentication error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const checkRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (allowedRoles.includes(req.user.primaryRole)) {
      return next();
    }

    const hasMembershipRole = req.user.memberships.some((membership: { organizationId: number; role: UserRole }) => 
      allowedRoles.includes(membership.role)
    );

    if (hasMembershipRole) {
      return next();
    }

    return res.status(403).json({ error: 'Access denied: Insufficient permissions' });
  };
};
