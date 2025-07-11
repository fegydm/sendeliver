// File: back/src/controllers/auth.controllers.ts
// Last change: Added 'domain: 'localhost'' to cookie settings.

import { PrismaClient, UserRole } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { Request, Response, NextFunction, RequestHandler } from 'express';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const scrypt = promisify(_scrypt);

const handleError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString('hex')}`;
}

async function verifyPassword(stored: string, password: string): Promise<boolean> {
  const [salt, key] = stored.split(':');
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return key === derived.toString('hex');
}

export function setAuthCookie(res: Response, userId: number, role: UserRole) {
  const token = jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
  
  const isSecure = process.env.NODE_ENV === 'production';
  console.log(`[setAuthCookie] Setting cookie. NODE_ENV: ${process.env.NODE_ENV}, Secure flag: ${isSecure}`);

  res.cookie('auth', token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    domain: 'localhost' // <-- NOVÁ ZMENA: Nastav doménu pre cookie
  });
  
  return token;
}

export const registerUser: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { displayName, email, password } = req.body;
    
    if (!displayName || !email || !password) {
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
        displayName,
        email, 
        passwordHash, 
        role: UserRole.individual_user
      }
    });
    
    const token = setAuthCookie(res, user.id, user.role);
    
    res.status(201).json({
      user: { 
        id: user.id, 
        displayName: user.displayName, 
        email: user.email, 
        role: user.role, 
      },
      token
    });
    
  } catch (error) {
      console.error('[Auth] Registration error:', error);
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
        displayName: user.displayName, 
        email: user.email, 
        role: user.role, 
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

export const logoutUser: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  res.clearCookie('auth', { 
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    domain: 'localhost' // <-- NOVÁ ZMENA: Nastav doménu pre clearCookie
  });
  
  res.status(204).end();
};

export const getProfile: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !req.user.userId) {
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
      displayName: user.displayName, 
      email: user.email, 
      role: user.role, 
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
