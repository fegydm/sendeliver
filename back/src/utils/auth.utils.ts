// File: /back/src/utils/auth.utils.ts
import { scrypt as _scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { UserRole } from '@prisma/client';

const scrypt = promisify(_scrypt);

// Funkcia na hashovanie hesla
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString('hex')}`;
}

// Funkcia na vytvorenie a nastavenie JWT cookie
export function createAndSetCookie(res: Response, userId: number, role: UserRole) {
  const token = jwt.sign({ userId, role }, process.env.JWT_SECRET!, {
    expiresIn: '7d',
  });

  res.cookie('auth_token', token, {
    httpOnly: true, // Chráni pred XSS útokmi
    secure: process.env.NODE_ENV === 'production', // Posielať iba cez HTTPS v produkcii
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dní
  });
}