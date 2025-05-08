// File: ./back/src/controllers/auth.controllers.ts
// Last change: Added Request body type definition

import express from 'express';
import { PrismaClient, Role } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { OAuth2Client } from 'google-auth-library';

interface RequestWithBody extends express.Request {
  body: any;
  user?: {
    userId: number;
    role: Role;
    permissions: string[];
  };
}

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const scrypt = promisify(_scrypt);
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

type Handler = (
  req: RequestWithBody, 
  res: express.Response, 
  next: express.NextFunction
) => Promise<void> | void;

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

function setAuthCookie(res: express.Response, userId: number, role: Role) {
  const token = jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
  
  res.cookie('auth', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE
  });
  
  return token;
}

export const registerUser: Handler = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email and password are required' });
      return;
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: Role.client }
    });
    
    const token = setAuthCookie(res, user.id, user.role);
    
    res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, permissions: user.permissions },
      token
    });
  } catch (err) {
    next(err);
  }
};

export const loginUser: Handler = async (req, res, next) => {
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
      user: { id: user.id, name: user.name, email: user.email, role: user.role, permissions: user.permissions },
      token
    });
  } catch (err) {
    next(err);
  }
};

export const googleAuth: Handler = async (req, res, next) => {
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
          name: payload.name,
        }
      });
    }
    
    const token = setAuthCookie(res, user.id, user.role);
    
    res.json({ 
      user: { id: user.id, name: user.name, email: user.email, role: user.role, permissions: user.permissions },
      token
    });
  } catch (err) {
    next(err);
  }
};

export const logoutUser: Handler = (req, res) => {
  res.clearCookie('auth', { 
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
  
  res.status(204).end();
};

export const getProfile: Handler = async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role, permissions: user.permissions });
  } catch (err) {
    next(err);
  }
};