/*
File: ./back/src/controllers/auth.controllers.ts
Last change: Adjusted handlers to return void, matching RequestHandler signature
*/
import { RequestHandler } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
const scrypt = promisify(_scrypt);

// Hash a password using Node's crypto scrypt
enum HashAlgorithm {
  SCRYPT = 'scrypt'
}

/**
 * Derive a hash from a password using scrypt, returns salt:hash
 */
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString('hex')}`;
}

/**
 * Verify a password against a stored salt:hash string
 */
async function verifyPassword(stored: string, password: string): Promise<boolean> {
  const [salt, key] = stored.split(':');
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return key === derived.toString('hex');
}

export const registerUser: RequestHandler = async (req, res, next) => {
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
    const user = await prisma.user.create({ data: { name, email, passwordHash, role: Role.client } });
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, permissions: user.permissions },
      token
    });
    return;
  } catch (err) {
    next(err);
  }
};

export const loginUser: RequestHandler = async (req, res, next) => {
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

    const valid = await verifyPassword(user.passwordHash, password);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, permissions: user.permissions }, token });
    return;
  } catch (err) {
    next(err);
  }
};

export const getProfile: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as any;
    if (!authReq.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: authReq.user.userId } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ id: user.id, name: user.name, email: user.email, role: user.role, permissions: user.permissions });
    return;
  } catch (err) {
    next(err);
  }
};
