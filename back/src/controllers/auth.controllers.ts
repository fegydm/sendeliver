// File: back/src/controllers/auth.controllers.ts
// Last change: Fixed TypeScript types and error handling based on Prisma schema

import { PrismaClient, UserRole } from '@prisma/client'; // Corrected Role to UserRole
import jwt from 'jsonwebtoken';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { OAuth2Client } from 'google-auth-library';
import { Request, Response, NextFunction, RequestHandler, Router } from 'express';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const scrypt = promisify(_scrypt);
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Helper function for error handling
const handleError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

/**
 * Hashes a plain text password using a random salt and scrypt.
 * @param password The plain text password to hash.
 * @returns A promise that resolves to the hashed password string.
 */
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString('hex')}`;
}

/**
 * Verifies a plain text password against a stored hashed password.
 * @param stored The stored hashed password (salt:key).
 * @param password The plain text password to verify.
 * @returns A promise that resolves to true if passwords match, false otherwise.
 */
async function verifyPassword(stored: string, password: string): Promise<boolean> {
  const [salt, key] = stored.split(':');
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return key === derived.toString('hex');
}

/**
 * Sets an authentication cookie in the response.
 * @param res The Express response object.
 * @param userId The ID of the authenticated user.
 * @param role The role of the authenticated user (UserRole enum).
 * @returns The generated JWT token.
 */
function setAuthCookie(res: Response, userId: number, role: UserRole) { // Corrected Role to UserRole
  const token = jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
  
  res.cookie('auth', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    sameSite: 'lax', // CSRF protection
    maxAge: COOKIE_MAX_AGE
  });
  
  return token;
}

/**
 * Handles user registration.
 * Creates a new user in the database after hashing the password.
 */
export const registerUser: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { displayName, email, password } = req.body; // Corrected 'name' to 'displayName' based on schema
    
    if (!displayName || !email || !password) { // Check for displayName
      res.status(400).json({ error: 'Display name, email and password are required' });
      return;
    }
    
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }
    
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { 
        displayName, // Corrected 'name' to 'displayName'
        email, 
        passwordHash, 
        role: UserRole.individual_user // Corrected Role.client to UserRole.individual_user
      }
    });
    
    const token = setAuthCookie(res, user.id, user.role);
    
    res.status(201).json({
      user: { 
        id: user.id, 
        displayName: user.displayName, // Corrected 'name' to 'displayName'
        email: user.email, 
        role: user.role, 
        // Removed 'permissions' as it's not in the User model
      },
      token
    });
    
  } catch (error) {
    console.error('[Auth] Registration error:', error);
    // Pass error to next middleware if available, otherwise send 500 response
    if (next) {
      next(error);
    } else {
      res.status(500).json({ 
        error: 'Registration failed',
        message: handleError(error)
      });
    }
  }
};

/**
 * Handles user login.
 * Verifies credentials and sets an authentication cookie.
 */
export const loginUser: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    
    if (!user.passwordHash) {
      res.status(400).json({ error: 'Account only supports Google login' });
      return;
    }
    
    const valid = await verifyPassword(user.passwordHash, password);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    
    const token = setAuthCookie(res, user.id, user.role);
    
    res.json({ 
      user: { 
        id: user.id, 
        displayName: user.displayName, // Corrected 'name' to 'displayName'
        email: user.email, 
        role: user.role, 
        // Removed 'permissions' as it's not in the User model
      },
      token
    });
    
  } catch (error) {
    console.error('[Auth] Login error:', error);
    if (next) {
      next(error);
    } else {
      res.status(500).json({ 
        error: 'Login failed',
        message: handleError(error)
      });
    }
  }
};

/**
 * Handles Google OAuth authentication.
 * Verifies Google ID token, creates or finds user, and sets authentication cookie.
 */
export const googleAuth: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      res.status(400).json({ error: 'idToken is required' });
      return;
    }
    
    const ticket = await googleClient.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    
    if (!payload || !payload.sub || !payload.email) {
      res.status(400).json({ error: 'Invalid Google token' });
      return;
    }
    
    let user = await prisma.user.findUnique({ where: { googleId: payload.sub } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          googleId: payload.sub,
          email: payload.email,
          displayName: payload.name || 'Google User', // Corrected 'name' to 'displayName'
          role: UserRole.individual_user // Corrected Role.client to UserRole.individual_user
        }
      });
    }
    
    const token = setAuthCookie(res, user.id, user.role);
    
    res.json({ 
      user: { 
        id: user.id, 
        displayName: user.displayName, // Corrected 'name' to 'displayName'
        email: user.email, 
        role: user.role, 
        // Removed 'permissions' as it's not in the User model
      },
      token
    });
    
  } catch (error) {
    console.error('[Auth] Google auth error:', error);
    if (next) {
      next(error);
    } else {
      res.status(500).json({ 
        error: 'Google authentication failed',
        message: handleError(error)
      });
    }
  }
};

/**
 * Handles user logout.
 * Clears the authentication cookie.
 */
export const logoutUser: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  res.clearCookie('auth', { 
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/' // Ensure the path matches the one used when setting the cookie
  });
  
  res.status(204).end(); // 204 No Content for successful deletion
};

/**
 * Retrieves the profile of the authenticated user.
 */
export const getProfile: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // req.user is typically populated by an authentication middleware
    // Make sure your middleware correctly attaches user info to req.user
    if (!req.user || !req.user.userId) { // Added check for req.user.userId
      res.status(401).json({ error: 'Not authenticated or user ID missing from token' });
      return;
    }
    
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    res.json({ 
      id: user.id, 
      displayName: user.displayName, // Corrected 'name' to 'displayName'
      email: user.email, 
      role: user.role, 
      // Removed 'permissions' as it's not in the User model
    });
    
  } catch (error) {
    console.error('[Auth] Profile error:', error);
    if (next) {
      next(error);
    } else {
      res.status(500).json({ 
        error: 'Failed to get profile',
        message: handleError(error)
      });
    }
  }
};
