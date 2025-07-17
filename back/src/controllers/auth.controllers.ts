// File: back/src/controllers/auth.controllers.ts
// Last change: Combined all logic into a single, self-contained file

import { PrismaClient, UserRole } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { randomBytes, scrypt as _scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'util';
import { Request, Response, RequestHandler } from 'express';
import { setCsrfCookie, CSRF_COOKIE_NAME } from '../middlewares/csrf.middleware.js';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN;
const scrypt = promisify(_scrypt);

const handleError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${hash.toString('hex')}`;
}

async function verifyPassword(storedPasswordHash: string, suppliedPassword: string): Promise<boolean> {
  const [salt, key] = storedPasswordHash.split(':');
  if (!salt || !key) return false;
  const keyBuffer = Buffer.from(key, 'hex');
  const hashToCompare = (await scrypt(suppliedPassword, salt, 64)) as Buffer;
  if (keyBuffer.length !== hashToCompare.length) return false;
  return timingSafeEqual(keyBuffer, hashToCompare);
}

export function setAuthCookie(res: Response, userId: number, role: UserRole) {
  const token = jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
  const isSecure = process.env.NODE_ENV === 'production';

  res.cookie('auth', token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? 'none' : 'lax',
    maxAge: COOKIE_MAX_AGE,
    domain: COOKIE_DOMAIN || undefined,
  });
  
  return token;
}

export const registerUser: RequestHandler = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const displayName = name;

    if (!displayName || !email || !password) {
      res.status(400).json({ message: 'Name, email and password are required.' });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ message: 'Password must be at least 8 characters long.' });
      return;
    }
    
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      if (existing.googleId && !existing.passwordHash) {
        res.status(409).json({ 
          message: 'This email is already registered with a Google account.',
          errorCode: 'USER_EXISTS_SOCIAL_LOGIN'
        });
        return;
      }
      res.status(409).json({ message: 'An account with this email already exists.' });
      return;
    }
    
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { 
        displayName,
        email: email.toLowerCase(), 
        passwordHash, 
        role: UserRole.individual_user
      }
    });
    
    const token = setAuthCookie(res, user.id, user.role);
    const csrfToken = setCsrfCookie(res);
    
    res.status(201).json({
      user: { 
        id: user.id, 
        name: user.displayName,
        email: user.email, 
        role: user.role,
        imageUrl: (user as any).imageUrl 
      },
      token,
      csrfToken
    });
    
  } catch (error) {
    console.error('[Auth] Registration error:', error);
    res.status(500).json({ 
      message: 'An unexpected error occurred during registration.',
      details: handleError(error)
    });
  }
};

export const loginUser: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }
    
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || !user.passwordHash) {
      res.status(401).json({ message: 'Invalid credentials.' });
      return;
    }
    
    const valid = await verifyPassword(user.passwordHash, password);
    if (!valid) {
      res.status(401).json({ message: 'Invalid credentials.' });
      return;
    }
    
    const token = setAuthCookie(res, user.id, user.role);
    const csrfToken = setCsrfCookie(res);
    
    res.json({ 
      user: { 
        id: user.id, 
        name: user.displayName,
        email: user.email, 
        role: user.role,
        imageUrl: (user as any).imageUrl
      },
      token,
      csrfToken
    });
    
  } catch (error) {
    console.error('[Auth] Login error:', error);
    res.status(500).json({ 
      message: 'An unexpected error occurred during login.',
      details: handleError(error)
    });
  }
};

export const logoutUser: RequestHandler = (req, res) => {
  res.clearCookie('auth', { 
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    domain: COOKIE_DOMAIN || undefined
  });
  res.clearCookie(CSRF_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    domain: COOKIE_DOMAIN || undefined
  });
  
  res.status(204).end();
};

export const getProfile: RequestHandler = async (req, res) => {
  try {
    const userId = (req.user as { userId: number } | undefined)?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Not authenticated or user ID missing from token' });
      return;
    }
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    const csrfToken = setCsrfCookie(res);

    res.json({ 
      id: user.id, 
      name: user.displayName,
      email: user.email, 
      role: user.role,
      imageUrl: (user as any).imageUrl,
      csrfToken
    });
    
  } catch (error) {
    console.error('[Auth] Profile error:', error);
    res.status(500).json({ 
      message: 'Failed to get profile.',
      details: handleError(error)
    });
  }
};