// File: back/src/routes/auth.routes.ts
// Last change: Added routes for email verification (by code, by link, resend).

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
  verifyEmailByCode, // Import new function
  verifyEmailByLink, // Import new function
  resendVerification // Import new function
} from '../controllers/auth.controllers.js';
import { authenticateJWT, checkRole } from '../middlewares/auth.middleware.js';
import { UserRole, UserType } from '@prisma/client';

const router = Router();

// --- Existing User Authentication Routes ---
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/profile', authenticateJWT, getProfile);

// --- New Organization Registration Route ---
router.post('/register-organization', registerOrganization);

// --- Account Linking Routes ---
router.post('/request-account-link', requestAccountLink);
router.post('/complete-account-link', completeAccountLink);

// --- Email Verification Routes ---
router.post('/verify-email-by-code', verifyEmailByCode); // Endpoint for code verification (POST for body)
router.get('/verify-email-by-link', verifyEmailByLink); // Endpoint for link verification (GET for query params)
router.post('/resend-verification', resendVerification); // Endpoint to resend verification (POST for body)


// --- Existing User Profile and Google OAuth Routes ---
// Example of using checkRole middleware: Only ORG_ADMIN or SUPERADMIN can update roles via this endpoint.
router.patch('/me/role', authenticateJWT, checkRole(UserRole.org_admin, UserRole.superadmin), async (req: Request, res: Response) => {
  const { selectedRole } = req.body;
  // req.user is guaranteed to exist and have userId and primaryRole due to authenticateJWT
  const userId = req.user!.userId; 

  const validRoles: string[] = ["client", "forwarder", "carrier"]; // These map to SelectedRoleType
  if (!selectedRole || !validRoles.includes(selectedRole)) {
    return res.status(400).json({ error: 'Invalid role provided.' });
  }

  try {
    // Note: This endpoint updates 'selectedRole', not the primary 'role' or membership roles.
    await prisma.user.update({
      where: { id: userId },
      data: { selectedRole: selectedRole as any }, // Type assertion for selectedRole might be needed
    });
    res.status(200).json({ message: 'Role updated successfully.' });
  } catch (error: any) { // Explicitly type error
    console.error("Error updating user selectedRole:", error);
    res.status(500).json({ error: 'Failed to update selected role.' });
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
  async (req: Request, res: Response) => {
    try {
      // Passport.js attaches user data to req.user after successful authentication.
      // req.user is already of type Express.User from passport.config.ts,
      // which now includes userType, primaryRole, and memberships.
      const user = req.user as Express.User | undefined;

      if (!user || !user.userId) { // Check userId, as other fields are guaranteed by Express.User type
        res.status(302).set('Location', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed`).end();
        return;
      }
      
      // Use data from req.user (which already contains userType, primaryRole, memberships from passport.config.ts)
      setAuthCookie(res, user.userId, user.userType, user.primaryRole, user.memberships);
      
      res.status(302).set('Location', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?status=success`).end();
      
    } catch (error) {
      console.error('[Google OAuth] Error in callback:', error);
      res.status(302).set('Location', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed`).end();
    }
  }
);

export default router;
