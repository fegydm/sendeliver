// File: back/src/controllers/auth.controllers.ts
// Last change: Complete final version with email dev mode using existing ENV variables

import { PrismaClient, UserRole, UserType, OrgMembershipStatus, VerificationStatus } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { sendEmail } from '../services/gmail.simple.service.js';


const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const VERIFICATION_TOKEN_EXPIRATION_MINUTES = 15;
const scrypt = promisify(_scrypt);

const handleError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString('hex')}`;
}

export async function verifyPassword(stored: string, password: string): Promise<boolean> {
  const [salt, key] = stored.split(':');
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return key === derived.toString('hex');
}

export function setAuthCookie(res: Response, userId: number, userType: UserType, primaryRole: UserRole, memberships: { organizationId: number; role: UserRole }[]) {
  const token = jwt.sign({ userId, userType, primaryRole, memberships }, JWT_SECRET, { expiresIn: '7d' });
  const isSecure = process.env.NODE_ENV === 'production';
  console.log(`[setAuthCookie] Setting cookie. NODE_ENV: ${process.env.NODE_ENV}, Secure flag: ${isSecure}`);

  res.cookie('auth', token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
  });
  return token;
}

async function generateAndSaveVerificationToken(userId: number): Promise<string> {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_EXPIRATION_MINUTES * 60 * 1000);

  await prisma.emailVerificationToken.deleteMany({
    where: { userId: userId }
  });

  await prisma.emailVerificationToken.create({
    data: {
      userId: userId,
      token: token,
      expiresAt: expiresAt,
    }
  });
  return token;
}

async function sendUserVerificationEmail(user: { id: number; email: string; displayName: string | null; }) {
  const verificationToken = await generateAndSaveVerificationToken(user.id);
  const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
  const verificationCode = verificationToken.substring(0, 6).toUpperCase();

  // 🎯 USE YOUR EXISTING ENV VARIABLES
  const isDevMode = process.env.EMAIL_MODE === 'development';
  const emailRecipient = isDevMode ? process.env.TEST_EMAIL || user.email : user.email;
  const isTestEmail = isDevMode && (emailRecipient !== user.email);

  console.log('[EMAIL_SENDING] =================================');
  console.log('[EMAIL_SENDING] Email configuration:');
  console.log('[EMAIL_SENDING] Mode:', process.env.EMAIL_MODE);
  console.log('[EMAIL_SENDING] Is dev mode:', isDevMode);
  console.log('[EMAIL_SENDING] Is test email redirect:', isTestEmail);
  console.log('[EMAIL_SENDING] Original user email:', user.email);
  console.log('[EMAIL_SENDING] Actual recipient:', emailRecipient);
  console.log('[EMAIL_SENDING] Verification code:', verificationCode);
  console.log('[EMAIL_SENDING] =================================');

  await sendEmail({
    to: emailRecipient,
    subject: 'Verify Your Sendeliver Account',
    template: 'email-verification',
    context: {
      displayName: user.displayName || user.email,
      verificationLink: verificationLink,
      verificationCode: verificationCode,
      expirationMinutes: VERIFICATION_TOKEN_EXPIRATION_MINUTES,
      // 🎯 INCLUDE ORIGINAL EMAIL INFO WHEN REDIRECTED TO TEST EMAIL
      ...(isTestEmail && { 
        originalUserEmail: user.email,
        isTestMode: true
      })
    }
  });
}

export const registerUser: any = async (req: Request, res: Response, next: NextFunction) => {
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
        primaryRole: UserRole.individual_customer,
        userType: UserType.STANDALONE,
        isEmailVerified: false 
      }
    });
    
    await sendUserVerificationEmail(user);

    res.status(201).json({
  message: 'Registration successful! Please check your email for verification.',
  user: { 
    id: user.id, 
    name: user.displayName,
    email: user.email, 
    primaryRole: user.primaryRole,
    userType: user.userType,
    selectedRole: user.selectedRole,
    imageUrl: user.imageUrl,
    emailVerified: user.isEmailVerified,    // ← KEEP ONLY THIS LINE
    memberships: []
  },
});
    return;
    
  } catch (error) {
    console.error('[Auth] Registration error:', error);
    res.status(500).json({ 
      message: 'An unexpected error occurred during registration.',
      details: handleError(error)
    });
    return;
  }
};

export const registerOrganization: any = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { organizationName, vatNumber, adminName, adminEmail, adminPassword } = req.body;

    if (!organizationName || !adminName || !adminEmail || !adminPassword) {
      res.status(400).json({ message: 'Organization name, admin name, email, and password are required.' });
      return;
    }

    if (adminPassword.length < 8) {
      res.status(400).json({ message: 'Password must be at least 8 characters long.' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email: adminEmail.toLowerCase() } });
    if (existingUser) {
      res.status(409).json({ message: 'An account with this admin email already exists.' });
      return;
    }

    if (vatNumber) {
      const existingOrg = await prisma.organization.findUnique({ where: { vatNumber: vatNumber } });
      if (existingOrg) {
        res.status(409).json({ message: 'An organization with this VAT number already exists.' });
        return;
      }
    }

    const hashedPassword = await hashPassword(adminPassword);

    // 🎯 FIX: Use transaction to create org + admin, then update org with founder info
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create organization without founder info first
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
          vatNumber: vatNumber || null,
          type: 'CARRIER',
          status: VerificationStatus.PENDING_VERIFICATION,
        }
      });

      // 2. Create admin user with membership
      const adminUser = await tx.user.create({
        data: {
          displayName: adminName,
          email: adminEmail.toLowerCase(),
          passwordHash: hashedPassword,
          primaryRole: UserRole.org_admin,
          userType: UserType.ORGANIZED,
          isEmailVerified: false,
          memberships: {
            create: {
              organizationId: organization.id,
              role: UserRole.org_admin,
              status: OrgMembershipStatus.ACTIVE
            }
          }
        },
        include: {
          memberships: {
            where: { status: OrgMembershipStatus.ACTIVE },
            select: { organizationId: true, role: true }
          }
        }
      });

      // 3. 🎯 UPDATE organization with founder information
      const updatedOrganization = await tx.organization.update({
        where: { id: organization.id },
        data: {
          foundedByUserId: adminUser.id,
          foundedAt: new Date()
        }
      });

      return { organization: updatedOrganization, adminUser };
    });

    await sendUserVerificationEmail(result.adminUser);

    res.status(201).json({
      message: 'Organization registered! Please check your email for verification.',
      user: {
        id: result.adminUser.id,
        name: result.adminUser.displayName,
        email: result.adminUser.email,
        primaryRole: result.adminUser.primaryRole,
        userType: result.adminUser.userType,
        imageUrl: result.adminUser.imageUrl,
        emailVerified: result.adminUser.isEmailVerified,
        memberships: result.adminUser.memberships
      },
      organization: {
        id: result.organization.id,
        name: result.organization.name,
        status: result.organization.status,
        foundedAt: result.organization.foundedAt  // 🎯 Now includes foundedAt
      },
    });
    return;

  } catch (error) {
    console.error('[Auth] Organization registration error:', error);
    res.status(500).json({
      message: 'An unexpected error occurred during organization registration.',
      details: handleError(error)
    });
    return;
  }
};

export const loginUser: any = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }
    
    const user = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() },
      include: {
        memberships: { 
          where: { status: OrgMembershipStatus.ACTIVE },
          select: { organizationId: true, role: true }
        }
      }
    });

    if (!user) {
      res.status(401).json({ message: 'Invalid credentials.' });
      return;
    }
    
    if (!user.passwordHash) {
      res.status(401).json({ 
        message: 'This account was created with a social login (e.g., Google) and does not have a password.',
        errorCode: 'ACCOUNT_IS_SOCIAL'
      });
      return;
    }
    
    const valid = await verifyPassword(user.passwordHash, password);
    if (!valid) {
      res.status(401).json({ message: 'Invalid credentials.' });
      return;
    }
    
    if (!user.isEmailVerified) {
      res.status(403).json({ message: 'Váš e-mail nie je overený. Prosím, skontrolujte si schránku a overte si účet.' });
      return;
    }

    const token = setAuthCookie(res, user.id, user.userType, user.primaryRole, user.memberships); 
    
    res.json({ 
  user: { 
    id: user.id, 
    name: user.displayName,
    email: user.email, 
    primaryRole: user.primaryRole,
    userType: user.userType,
    selectedRole: user.selectedRole,
    imageUrl: user.imageUrl,
    emailVerified: user.isEmailVerified,    // ← KEEP ONLY THIS LINE
    memberships: user.memberships
  },
  token
});
    return;
    
  } catch (error) {
    console.error('[Auth] Login error:', error);
    res.status(500).json({ 
      message: 'An unexpected error occurred during login.',
      details: handleError(error)
    });
    return;
  }
};

export const logoutUser: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  res.clearCookie('auth', { 
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    domain: 'localhost'
  });
  
  res.status(204).end();
};

export const getProfile: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Not authenticated or user ID missing from token' });
      return;
    }
    
    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      include: {
        memberships: { 
          where: { status: OrgMembershipStatus.ACTIVE },
          select: { organizationId: true, role: true }
        }
      }
    });

    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }
    
    res.json({ 
  id: user.id, 
  name: user.displayName,
  email: user.email, 
  primaryRole: user.primaryRole,
  userType: user.userType,
  selectedRole: user.selectedRole,
  imageUrl: user.imageUrl,
  emailVerified: user.isEmailVerified,    // ← KEEP ONLY THIS LINE
  memberships: user.memberships
});
    return;
    
  } catch (error) {
    console.error('[Auth] Profile error:', error);
    res.status(500).json({ 
      message: 'Failed to get profile.',
      details: handleError(error)
    });
    return;
  }
};

export const requestAccountLink: any = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  try {
    const user = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() },
      include: {
        memberships: {
          where: { status: OrgMembershipStatus.ACTIVE },
          select: { organizationId: true, role: true }
        }
      }
    });

    if (!user || !user.googleId || user.passwordHash) {
      return res.status(400).json({ error: "This account is not eligible for linking." });
    }

    const linkToken = jwt.sign(
      { 
        userId: user.id, 
        purpose: 'account-link',
        primaryRole: user.primaryRole,
        userType: user.userType,
        isEmailVerified: user.isEmailVerified,
        memberships: user.memberships
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '15m' }
    );

    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/complete-account-link?token=${linkToken}`;

    console.log(`[DEV] Account link URL for ${user.email}: ${verificationUrl}`); 

    res.status(200).json({ message: 'Verification email sent.' });
    return;

  } catch (error) {
    console.error("Error requesting account link:", error);
    res.status(500).json({ error: 'Failed to process request.' });
    return;
  }
};

export const completeAccountLink: any = async (req: Request, res: Response) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: 'Token and password are required.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { 
      userId: number; 
      purpose: string; 
      primaryRole: UserRole;
      userType: UserType;
      isEmailVerified: boolean;
      memberships: { organizationId: number; role: UserRole }[];
    };
    
    if (decoded.purpose !== 'account-link') {
      return res.status(400).json({ error: 'Invalid token purpose.' });
    }

    const user = await prisma.user.findUnique({ 
      where: { id: decoded.userId },
      include: {
        memberships: {
          where: { status: OrgMembershipStatus.ACTIVE },
          select: { organizationId: true, role: true }
        }
      }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const hashedPassword = await hashPassword(password);
    
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword },
    });
    
    setAuthCookie(res, updatedUser.id, updatedUser.userType, updatedUser.primaryRole, user.memberships);

    res.status(200).json({ 
  user: { 
    id: updatedUser.id, 
    name: updatedUser.displayName,
    email: updatedUser.email,
    primaryRole: updatedUser.primaryRole,
    userType: updatedUser.userType,
    selectedRole: updatedUser.selectedRole,
    imageUrl: updatedUser.imageUrl,
    emailVerified: user.isEmailVerified,    // ← KEEP ONLY THIS LINE
    memberships: user.memberships
  } 
});
    return;

  } catch (error) {
    console.error("Error completing account link:", error);
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

export const verifyEmailByCode: any = async (req: Request, res: Response) => {
  const { email, code } = req.body;

  console.log('[EMAIL_VERIFICATION_CODE] =================================');
  console.log('[EMAIL_VERIFICATION_CODE] Starting email verification by code');
  console.log('[EMAIL_VERIFICATION_CODE] Request data:', {
    email: email,
    code: code,
    emailMode: process.env.EMAIL_MODE,
    testEmail: process.env.TEST_EMAIL
  });

  if (!email || !code) {
    console.log('[EMAIL_VERIFICATION_CODE] ❌ ERROR: Missing required fields');
    return res.status(400).json({ 
      success: false,
      message: 'Email and verification code are required.' 
    });
  }

  try {
    // Find user by email
    console.log('[EMAIL_VERIFICATION_CODE] 🔍 Looking up user by email...');
    const user = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() },
      include: {
        memberships: {
          where: { status: OrgMembershipStatus.ACTIVE },
          select: { organizationId: true, role: true }
        }
      }
    });

    console.log('[EMAIL_VERIFICATION_CODE] User lookup result:', {
      userFound: !!user,
      userId: user?.id,
      userEmail: user?.email,
      isAlreadyVerified: user?.isEmailVerified
    });

    if (!user) {
      console.log('[EMAIL_VERIFICATION_CODE] ❌ ERROR: User not found');
      return res.status(404).json({ 
        success: false,
        message: 'User not found with this email address.' 
      });
    }

    if (user.isEmailVerified) {
      console.log('[EMAIL_VERIFICATION_CODE] ⚠️ WARNING: Email is already verified');
      return res.status(400).json({ 
        success: false,
        message: 'Email is already verified.' 
      });
    }

    // Find verification token
    console.log('[EMAIL_VERIFICATION_CODE] 🔍 Looking up verification token...');
    let verificationToken = await prisma.emailVerificationToken.findFirst({
      where: { 
        userId: user.id,
        token: code.toLowerCase()
      },
      include: { user: true }
    });

    // If not found by full code, try by first 6 characters
    if (!verificationToken) {
      console.log('[EMAIL_VERIFICATION_CODE] 🔍 Trying lookup by first 6 characters...');
      const allUserTokens = await prisma.emailVerificationToken.findMany({
        where: { userId: user.id },
        include: { user: true }
      });

      console.log('[EMAIL_VERIFICATION_CODE] Available tokens for user:', allUserTokens.map(t => ({
        id: t.id,
        prefix: t.token.substring(0, 6).toUpperCase(),
        expiresAt: t.expiresAt
      })));
      
      verificationToken = allUserTokens.find(token => 
        token.token.substring(0, 6).toUpperCase() === code.toUpperCase()
      ) || null;

      if (verificationToken) {
        console.log('[EMAIL_VERIFICATION_CODE] ✅ Token found by prefix match');
      }
    }

    if (!verificationToken) {
      console.log('[EMAIL_VERIFICATION_CODE] ❌ ERROR: Invalid verification code');
      return res.status(400).json({ 
        success: false,
        message: 'Invalid or expired verification code.' 
      });
    }

    // Check expiration
    if (verificationToken.expiresAt < new Date()) {
      console.log('[EMAIL_VERIFICATION_CODE] ❌ ERROR: Code has expired');
      return res.status(400).json({ 
        success: false,
        message: 'Verification code has expired. Please request a new one.' 
      });
    }

    console.log('[EMAIL_VERIFICATION_CODE] ✅ Code validation successful');
    console.log('[EMAIL_VERIFICATION_CODE] 🔄 Updating user verification status...');

    // Update user verification status
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true },
      include: {
        memberships: {
          where: { status: OrgMembershipStatus.ACTIVE },
          select: { organizationId: true, role: true }
        }
      }
    });

    // Clean up verification tokens
    console.log('[EMAIL_VERIFICATION_CODE] 🗑️ Cleaning up verification tokens...');
    await prisma.emailVerificationToken.deleteMany({ 
      where: { userId: user.id } 
    });

    // Set authentication cookie
    console.log('[EMAIL_VERIFICATION_CODE] 🍪 Setting authentication cookie...');
    const authToken = setAuthCookie(res, updatedUser.id, updatedUser.userType, updatedUser.primaryRole, updatedUser.memberships);

    console.log('[EMAIL_VERIFICATION_CODE] 🎉 EMAIL VERIFICATION COMPLETED');
    console.log('[EMAIL_VERIFICATION_CODE] =================================');

    res.status(200).json({ 
      success: true,
      message: 'Email successfully verified! You are now logged in.',
     user: {
  id: updatedUser.id,
  name: updatedUser.displayName,
  email: updatedUser.email,
  primaryRole: updatedUser.primaryRole,
  userType: updatedUser.userType,
  selectedRole: updatedUser.selectedRole,
  imageUrl: updatedUser.imageUrl,
  emailVerified: updatedUser.isEmailVerified,         // ← KEEP ONLY THIS LINE
  memberships: updatedUser.memberships
},

      token: authToken
    });
    return;

  } catch (error) {
    console.error('[EMAIL_VERIFICATION_CODE] 💥 CRITICAL ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred during email verification.',
      details: process.env.NODE_ENV === 'development' ? handleError(error) : 'Internal server error'
    });
    return;
  }
};

export const verifyEmailByLink: any = async (req: Request, res: Response) => {
  const token = req.query.token as string;

  console.log('[EMAIL_VERIFICATION_LINK] =================================');
  console.log('[EMAIL_VERIFICATION_LINK] Starting email verification by link');
  console.log('[EMAIL_VERIFICATION_LINK] Token received:', token?.substring(0, 12) + '...');

  if (!token) {
    console.log('[EMAIL_VERIFICATION_LINK] ❌ ERROR: Token missing');
    return res.status(400).json({ 
      success: false,
      message: 'Invalid verification link: Token missing.' 
    });
  }

  try {
    console.log('[EMAIL_VERIFICATION_LINK] 🔍 Looking up token in database...');
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token: token },
      include: { user: true }
    });

    if (!verificationToken) {
      console.log('[EMAIL_VERIFICATION_LINK] ❌ ERROR: Token not found');
      return res.status(400).json({ 
        success: false,
        message: 'Invalid verification link: Token not found.' 
      });
    }

    if (verificationToken.expiresAt < new Date()) {
      console.log('[EMAIL_VERIFICATION_LINK] ❌ ERROR: Token expired');
      return res.status(400).json({ 
        success: false,
        message: 'Verification link has expired. Please request a new one.' 
      });
    }

    // Check if already verified
    if (verificationToken.user.isEmailVerified) {
      console.log('[EMAIL_VERIFICATION_LINK] ⚠️ WARNING: Already verified');
      await prisma.emailVerificationToken.delete({ where: { id: verificationToken.id } });
      return res.status(200).json({
        success: true,
        message: 'Email is already verified.',
        alreadyVerified: true
      });
    }

    console.log('[EMAIL_VERIFICATION_LINK] ✅ Starting verification process...');
    
    // Update user verification status
    const updatedUser = await prisma.user.update({
      where: { id: verificationToken.user.id },
      data: { isEmailVerified: true },
      include: {
        memberships: {
          where: { status: OrgMembershipStatus.ACTIVE },
          select: { organizationId: true, role: true }
        }
      }
    });

    // Clean up verification token
    await prisma.emailVerificationToken.delete({ where: { id: verificationToken.id } });

    // 🎯 NO AUTO-LOGIN FOR LINK VERIFICATION - Security best practice
    console.log('[EMAIL_VERIFICATION_LINK] 🎉 EMAIL VERIFICATION COMPLETED (no auto-login)');
    console.log('[EMAIL_VERIFICATION_LINK] =================================');

    res.status(200).json({
      success: true,
      message: 'Email successfully verified! You can now log in with your credentials.',
      emailVerified: true,
      // 🎯 NO user data or auth token - user must log in manually
    });
    return;

  } catch (error) {
    console.error('[EMAIL_VERIFICATION_LINK] 💥 CRITICAL ERROR:', error);
    res.status(500).json({ 
      success: false,
      message: 'An unexpected error occurred during email verification.',
      details: process.env.NODE_ENV === 'development' ? handleError(error) : 'Internal server error'
    });
    return;
  }
};

export const resendVerification: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ message: 'Email is required.' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, displayName: true, isEmailVerified: true }
    });

    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    if (user.isEmailVerified) {
      res.status(400).json({ message: 'Email is already verified.' });
      return;
    }

    await sendUserVerificationEmail(user);

    res.status(200).json({ message: 'Verification email resent successfully.' });
  } catch (error) {
    console.error('[Auth] Resend verification error:', error);
    res.status(500).json({
      message: 'An unexpected error occurred while resending verification email.',
      details: handleError(error)
    });
  }
};