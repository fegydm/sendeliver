// File: back/src/routes/auth.routes.ts
// Last change: Split into public and authenticated routers for precise middleware application.

import { Router, Request, Response } from 'express';
import passport from 'passport';
import { prisma } from '../configs/prisma.config.js'; 
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  getProfile, 
  requestAccountLink, 
  completeAccountLink, 
  setAuthCookie,
  registerOrganization,
  verifyEmailByCode,
  verifyEmailByLink,
  resendVerification
} from '../controllers/auth.controllers.js';
import { authenticateJWT, checkRole } from '../middlewares/auth.middleware.js';
import { UserRole, UserType } from '@prisma/client';

// --- Public Auth Router (No Authentication/Session Required) ---
export const publicAuthRouter = Router();

publicAuthRouter.post('/register', registerUser);
publicAuthRouter.post('/login', loginUser);
publicAuthRouter.post('/register-organization', registerOrganization);

// Email Verification Routes - MUST be public
publicAuthRouter.post('/verify-email-by-code', verifyEmailByCode);
publicAuthRouter.get('/verify-email-by-link', verifyEmailByLink);
publicAuthRouter.post('/resend-verification', resendVerification);

// Account Linking Routes - These typically don't require prior authentication
publicAuthRouter.post('/request-account-link', requestAccountLink);
publicAuthRouter.post('/complete-account-link', completeAccountLink);

// Google OAuth routes are special:
// The initial /google route does not need authenticateJWT or passport.session().
// The /google/callback route is handled by Passport.js and sets the cookie itself.
publicAuthRouter.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

publicAuthRouter.get(
  '/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google_failed`
  }),
  async (req: Request, res: Response) => {
    try {
      const user = req.user as Express.User | undefined;

      if (!user || !user.userId) {
        res.status(302).set('Location', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed`).end();
        return;
      }
      
      setAuthCookie(res, user.userId, user.userType, user.primaryRole, user.memberships);
      
      res.status(302).set('Location', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?status=success`).end();
      
    } catch (error) {
      console.error('[Google OAuth] Error in callback:', error);
      res.status(302).set('Location', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed`).end();
    }
  }
);


// --- Authenticated Auth Router (Requires authenticateJWT middleware) ---
export const authenticatedAuthRouter = Router();

// Apply authentication middleware to all routes in this router
authenticatedAuthRouter.use(authenticateJWT); 

authenticatedAuthRouter.post('/logout', logoutUser);
authenticatedAuthRouter.get('/profile', getProfile);

authenticatedAuthRouter.patch('/me/role', checkRole(UserRole.org_admin, UserRole.superadmin), async (req: Request, res: Response) => {
  const { selectedRole } = req.body;
  const userId = req.user!.userId; 

  const validRoles: string[] = ["client", "forwarder", "carrier"];
  if (!selectedRole || !validRoles.includes(selectedRole)) {
    return res.status(400).json({ error: 'Invalid role provided.' });
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { selectedRole: selectedRole as any },
    });
    res.status(200).json({ message: 'Role updated successfully.' });
  } catch (error: any) {
    console.error("Error updating user selectedRole:", error);
    res.status(500).json({ error: 'Failed to update selected role.' });
  }
});
