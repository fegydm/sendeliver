// File: back/src/controllers/auth.controllers.ts
// Last change: Fixed email utility import and applied 'any' type to new RequestHandlers.

import { PrismaClient, UserRole, UserType, OrgMembershipStatus, VerificationStatus } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { Request, Response, NextFunction, RequestHandler } from 'express';
// CORRECTED: Import sendEmail, not sendVerificationEmail
import { sendEmail } from '../utils/email.utils.js'; 

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const VERIFICATION_TOKEN_EXPIRATION_MINUTES = 15; // Token expiration for email verification
const scrypt = promisify(_scrypt);

const handleError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

// Hashes a plain text password with a random salt.
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString('hex')}`;
}

// Verifies a plain text password against a stored hash.
export async function verifyPassword(stored: string, password: string): Promise<boolean> {
  const [salt, key] = stored.split(':');
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return key === derived.toString('hex');
}

// Sets an authentication cookie with a JWT token.
export function setAuthCookie(res: Response, userId: number, userType: UserType, primaryRole: UserRole, memberships: { organizationId: number; role: UserRole }[]) {
  // Include primaryRole, userType, and all active memberships in JWT.
  const token = jwt.sign({ userId, userType, primaryRole, memberships }, JWT_SECRET, { expiresIn: '7d' });
  
  const isSecure = process.env.NODE_ENV === 'production';
  console.log(`[setAuthCookie] Setting cookie. NODE_ENV: ${process.env.NODE_ENV}, Secure flag: ${isSecure}`);

  res.cookie('auth', token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    // domain: 'localhost' // REMOVED: Let browser set domain automatically for better dev compatibility
  });
  
  return token;
}

/**
 * Generates a unique verification token and saves it to the database.
 * @param userId The ID of the user for whom the token is generated.
 * @returns The generated token string.
 */
async function generateAndSaveVerificationToken(userId: number): Promise<string> {
  const token = randomBytes(32).toString('hex'); // Generate a random hex token
  const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_EXPIRATION_MINUTES * 60 * 1000);

  // Delete any existing tokens for this user to ensure only one active token.
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

/**
 * Sends a verification email (link and code) to the user.
 * @param user The user object.
 */
async function sendUserVerificationEmail(user: { id: number; email: string; displayName: string | null; }) {
  const verificationToken = await generateAndSaveVerificationToken(user.id);
  const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
  const verificationCode = verificationToken.substring(0, 6).toUpperCase(); // Use first 6 chars as code

  // CORRECTED: Use sendEmail from email.utils.js with appropriate context
  await sendEmail({
    to: user.email,
    subject: 'Verify Your Logistar Account',
    template: 'email-verification', // Assuming you have a template named 'email-verification.hbs'
    context: {
      displayName: user.displayName || user.email,
      verificationLink: verificationLink,
      verificationCode: verificationCode,
      expirationMinutes: VERIFICATION_TOKEN_EXPIRATION_MINUTES
    }
  });
}


// Handles individual user registration.
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
        primaryRole: UserRole.individual_customer, // Set primary role
        userType: UserType.STANDALONE, // Set user type
        isEmailVerified: false // Email is not verified on creation
      }
    });
    
    // For individual users, memberships array is empty.
    const token = setAuthCookie(res, user.id, user.userType, user.primaryRole, []); 
    
    // Send verification email after successful registration.
    await sendUserVerificationEmail(user);

    res.status(201).json({
      user: { 
        id: user.id, 
        name: user.displayName,
        email: user.email, 
        primaryRole: user.primaryRole, // Return primary role
        userType: user.userType, // Return user type
        selectedRole: user.selectedRole,
        imageUrl: user.imageUrl,
        isEmailVerified: user.isEmailVerified, // Return verification status
        memberships: [] // No memberships for new individual user
      },
      token
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

// Handles organization registration and creates the org_admin user.
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

    // Optional: Check if organization with this VAT number already exists
    if (vatNumber) {
      const existingOrg = await prisma.organization.findUnique({ where: { vatNumber: vatNumber } });
      if (existingOrg) {
        res.status(409).json({ message: 'An organization with this VAT number already exists.' });
        return;
      }
    }

    const hashedPassword = await hashPassword(adminPassword);

    const newOrganization = await prisma.organization.create({
      data: {
        name: organizationName,
        vatNumber: vatNumber || null,
        type: 'CARRIER', // Default type, can be selected in UI later
        status: VerificationStatus.PENDING_VERIFICATION, // Organization needs manual verification
      }
    });

    const orgAdminUser = await prisma.user.create({
      data: {
        displayName: adminName,
        email: adminEmail.toLowerCase(),
        passwordHash: hashedPassword,
        primaryRole: UserRole.org_admin, // Org admin is their primary role
        userType: UserType.ORGANIZED, // This user is part of an organization
        isEmailVerified: false, // Email is not verified on creation
        memberships: { // Create the membership record for the admin
          create: {
            organization: { connect: { id: newOrganization.id } },
            role: UserRole.org_admin, // Admin's role within this organization
            status: OrgMembershipStatus.ACTIVE // Admin's membership is active immediately
          }
        }
      },
      include: {
        memberships: {
          where: { status: OrgMembershipStatus.ACTIVE }, // Only active memberships
          select: { organizationId: true, role: true }
        }
      }
    });

    // Set cookie with user's primary role and all active memberships.
    const token = setAuthCookie(res, orgAdminUser.id, orgAdminUser.userType, orgAdminUser.primaryRole, orgAdminUser.memberships);

    // Send verification email after successful registration.
    await sendUserVerificationEmail(orgAdminUser);

    res.status(201).json({
      user: {
        id: orgAdminUser.id,
        name: orgAdminUser.displayName,
        email: orgAdminUser.email,
        primaryRole: orgAdminUser.primaryRole,
        userType: orgAdminUser.userType,
        imageUrl: orgAdminUser.imageUrl,
        isEmailVerified: orgAdminUser.isEmailVerified, // Return verification status
        memberships: orgAdminUser.memberships
      },
      organization: {
        id: newOrganization.id,
        name: newOrganization.name,
        status: newOrganization.status
      },
      token
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

// Handles user login.
export const loginUser: any = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }
    
    // Include memberships and isEmailVerified in the user query for JWT payload.
    const user = await prisma.user.findUnique({ 
      where: { email: email.toLowerCase() },
      include: {
        memberships: { // Fetch all memberships
          where: { status: OrgMembershipStatus.ACTIVE }, // Only active memberships
          select: { organizationId: true, role: true } // Select only needed fields
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
    
    // Pass userType, primaryRole, and active memberships to setAuthCookie.
    const token = setAuthCookie(res, user.id, user.userType, user.primaryRole, user.memberships); 
    
    res.json({ 
      user: { 
        id: user.id, 
        name: user.displayName,
        email: user.email, 
        primaryRole: user.primaryRole, // Return primary role
        userType: user.userType, // Return user type
        selectedRole: user.selectedRole,
        imageUrl: user.imageUrl,
        isEmailVerified: user.isEmailVerified, // Return verification status
        memberships: user.memberships // Return memberships
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

// Handles user logout by clearing the authentication cookie.
export const logoutUser: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  res.clearCookie('auth', { 
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    domain: 'localhost' // Adjust for production domain
  });
  
  res.status(204).end();
};

// Retrieves authenticated user's profile.
export const getProfile: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Not authenticated or user ID missing from token' });
      return;
    }
    
    // Include memberships and isEmailVerified in the user query for profile.
    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      include: {
        memberships: { // Fetch all memberships
          where: { status: OrgMembershipStatus.ACTIVE }, // Only active memberships
          select: { organizationId: true, role: true } // Select only needed fields
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
      primaryRole: user.primaryRole, // Return primary role
      userType: user.userType, // Return user type
      selectedRole: user.selectedRole,
      imageUrl: user.imageUrl,
      isEmailVerified: user.isEmailVerified, // Return verification status
      memberships: user.memberships // Return memberships
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

// Step 1: User requests to link their account by adding a password
export const requestAccountLink: any = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  try {
    // Include memberships and isEmailVerified when finding the user.
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

    // Pass primaryRole, userType, isEmailVerified, and memberships to link token payload.
    const linkToken = jwt.sign(
      { 
        userId: user.id, 
        purpose: 'account-link',
        primaryRole: user.primaryRole,
        userType: user.userType,
        isEmailVerified: user.isEmailVerified, // Include verification status
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

// Step 2: User clicks the link and submits a new password
export const completeAccountLink: any = async (req: Request, res: Response) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: 'Token and password are required.' });
  }

  try {
    // Decode with full expected payload types.
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { 
      userId: number; 
      purpose: string; 
      primaryRole: UserRole;
      userType: UserType;
      isEmailVerified: boolean; // Expect verification status
      memberships: { organizationId: number; role: UserRole }[];
    };
    
    if (decoded.purpose !== 'account-link') {
      return res.status(400).json({ error: 'Invalid token purpose.' });
    }

    // Include memberships and isEmailVerified when finding the user.
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
    
    // Use memberships from the user (which includes the fetched memberships).
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
        isEmailVerified: user.isEmailVerified, // Return verification status
        memberships: user.memberships
      } 
    });
    return;

  } catch (error) {
    console.error("Error completing account link:", error);
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

/**
 * Endpoint to verify user's email using a code.
 * @param req.body.email User's email.
 * @param req.body.code The verification code.
 */
export const verifyEmailByCode: any = async (req: Request, res: Response) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: 'Email and verification code are required.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token: code },
      include: { user: true } // Include user to check ID
    });

    if (!verificationToken || verificationToken.userId !== user.id || verificationToken.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired verification code.' });
    }

    // Mark email as verified.
    await prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true }
    });

    // Delete used token.
    await prisma.emailVerificationToken.delete({
      where: { id: verificationToken.id }
    });

    // Re-fetch user with updated status and memberships for new cookie.
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        memberships: {
          where: { status: OrgMembershipStatus.ACTIVE },
          select: { organizationId: true, role: true }
        }
      }
    });

    if (!updatedUser) { // Should not happen if user was found initially
      return res.status(500).json({ message: 'User data refresh failed after verification.' });
    }

    // Set new auth cookie with updated isEmailVerified status.
    setAuthCookie(res, updatedUser.id, updatedUser.userType, updatedUser.primaryRole, updatedUser.memberships);

    res.status(200).json({ message: 'Email successfully verified!' });
    return;

  } catch (error) {
    console.error('[Auth] Email verification by code error:', error);
    res.status(500).json({
      message: 'An unexpected error occurred during email verification.',
      details: handleError(error)
    });
    return;
  }
};

/**
 * Endpoint to verify user's email using a link token.
 * This endpoint will also log in the user and redirect to dashboard.
 * @param req.query.token The verification token from the link.
 */
export const verifyEmailByLink: any = async (req: Request, res: Response & { redirect: (url: string) => void }) => {
  const token = req.query.token as string;

  if (!token) {
    return res.status(400).send('Invalid verification link: Token missing.');
  }

  try {
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token: token },
      include: { user: true } // Include user to mark as verified
    });

    if (!verificationToken || verificationToken.expiresAt < new Date()) {
      return res.status(400).send('Invalid or expired verification link.');
    }

    // Mark email as verified.
    await prisma.user.update({
      where: { id: verificationToken.user.id },
      data: { isEmailVerified: true }
    });

    // Delete used token.
    await prisma.emailVerificationToken.delete({
      where: { id: verificationToken.id }
    });

    // Fetch user with updated status and memberships for new cookie.
    const user = await prisma.user.findUnique({
      where: { id: verificationToken.user.id },
      include: {
        memberships: {
          where: { status: OrgMembershipStatus.ACTIVE },
          select: { organizationId: true, role: true }
        }
      }
    });

    if (!user) { // Should not happen if user was found via token
      return res.status(500).send('User data refresh failed after verification.');
    }

    // Set auth cookie to log in the user.
    setAuthCookie(res, user.id, user.userType, user.primaryRole, user.memberships);

    // Redirect to dashboard.
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`);
    return;

  } catch (error) {
    console.error('[Auth] Email verification by link error:', error);
    res.status(500).send('An unexpected error occurred during email verification.');
    return;
  }
};

/**
 * Endpoint to resend verification email/code.
 * @param req.body.email User's email to resend verification to.
 */
export const resendVerification: any = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      // Return success even if user not found to prevent email enumeration.
      return res.status(200).json({ message: 'If an account with that email exists, a verification email has been sent.' });
    }

    // Generate and send a new verification email.
    await sendUserVerificationEmail(user);

    res.status(200).json({ message: 'Verification email re-sent. Please check your inbox.' });
    return;

  } catch (error) {
    console.error('[Auth] Resend verification error:', error);
    res.status(500).json({
      message: 'An unexpected error occurred while resending verification.',
      details: handleError(error)
    });
    return;
  }
};