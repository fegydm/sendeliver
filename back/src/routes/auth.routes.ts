// File: back/src/routes/auth.routes.ts
// Last change: Fixed redirect type error by using res.status().set().

import { Router, Request, Response } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { prisma } from '../configs/prisma.config.js';
import { registerUser, loginUser, logoutUser, getProfile, setAuthCookie } from '../controllers/auth.controllers.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { UserRole } from '@prisma/client';
// Importujeme našu novú pomocnú funkciu
import { hashPassword } from '../utils/password.utils.js';

// Assume you have a utility function for sending emails
// import { sendEmail } from '../utils/mailer.util.js'; 

const router = Router();

// --- Existing User Authentication Routes ---
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/profile', authenticateJWT, getProfile);

// --- New Account Linking Routes ---

// Step 1: User requests to link their account by adding a password
router.post('/request-account-link', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    // This flow is only for users who exist, registered via social login (e.g., Google), and don't have a password yet.
    if (!user || !user.googleId || user.passwordHash) {
      return res.status(400).json({ error: "This account is not eligible for linking." });
    }

    const linkToken = jwt.sign(
      { userId: user.id, purpose: 'account-link' },
      process.env.JWT_SECRET as string,
      { expiresIn: '15m' }
    );

    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/complete-account-link?token=${linkToken}`;

    // TODO: Implement the actual email sending logic
    console.log(`[DEV] Account link URL for ${user.email}: ${verificationUrl}`); 

    res.status(200).json({ message: 'Verification email sent.' });

  } catch (error) {
    console.error("Error requesting account link:", error);
    res.status(500).json({ error: 'Failed to process request.' });
  }
});

// Step 2: User clicks the link and submits a new password
router.post('/complete-account-link', async (req: Request, res: Response) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: 'Token and password are required.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number; purpose: string };
    
    if (decoded.purpose !== 'account-link') {
      return res.status(400).json({ error: 'Invalid token purpose.' });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // --- KĽÚČOVÁ ZMENA ---
    // Namiesto bcrypt.hash používame našu novú, bezpečnú funkciu
    const hashedPassword = await hashPassword(password);
    
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword },
    });
    
    setAuthCookie(res, updatedUser.id, updatedUser.role);

    res.status(200).json({ 
      user: { 
        id: updatedUser.id, 
        name: updatedUser.displayName,
        email: updatedUser.email,
        role: updatedUser.role,
        selectedRole: updatedUser.selectedRole,
        imageUrl: (updatedUser as any).imageUrl 
      } 
    });

  } catch (error) {
    console.error("Error completing account link:", error);
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
});


// --- Existing User Profile and Google OAuth Routes ---
router.patch('/me/role', authenticateJWT, async (req: Request, res: Response) => {
  const { selectedRole } = req.body;
  const userId = (req.user as { id: number }).id;

  const validRoles: string[] = ["client", "forwarder", "carrier"];
  if (!selectedRole || !validRoles.includes(selectedRole)) {
    return res.status(400).json({ error: 'Invalid role provided.' });
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { selectedRole: selectedRole },
    });
    res.status(200).json({ message: 'Role updated successfully.' });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ error: 'Failed to update role.' });
  }
});

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google_failed`
  }),
  (req: Request, res: Response) => {
    try {
      const user = req.user as { id: number; role: UserRole } | undefined;

      if (!user || !user.id || !user.role) {
        // OPRAVA: Používame nízko-úrovňové presmerovanie
        res.status(302).set('Location', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed`).end();
        return;
      }
      
      setAuthCookie(res, user.id, user.role);
      
      // OPRAVA: Používame nízko-úrovňové presmerovanie
      res.status(302).set('Location', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?status=success`).end();
      
    } catch (error) {
      console.error('[Google OAuth] Error in callback:', error);
      // OPRAVA: Používame nízko-úrovňové presmerovanie
      res.status(302).set('Location', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed`).end();
    }
  }
);

export default router;
