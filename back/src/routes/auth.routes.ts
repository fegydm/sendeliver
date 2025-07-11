// File: back/src/routes/auth.routes.ts
// Last change: Unified Passport and JWT authentication flow

import { Router, Request, Response } from 'express';
import passport from 'passport';
import { registerUser, loginUser, logoutUser, getProfile, setAuthCookie } from '../controllers/auth.controllers.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { UserRole } from '@prisma/client';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/profile', authenticateJWT, getProfile);

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
      const user = req.user as { userId: number; role: UserRole };

      console.log('[Google OAuth] Callback received, user:', {
        userId: user?.userId,
        role: user?.role
      });

      if (!user || !user.userId || !user.role) {
        console.error('[Google OAuth] Invalid user data received:', user);
        res.status(302).set('Location', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed`).send();
        return;
      }

      console.log('[Google OAuth] Setting JWT cookie for user:', user.userId);
      
      // Use the existing setAuthCookie function to create JWT
      const token = setAuthCookie(res, user.userId, user.role);
      
      console.log('[Google OAuth] JWT cookie set successfully, redirecting to frontend');
      
      // Redirect to the auth callback page that will handle the success
      res.status(302).set('Location', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?status=success`).send();
      
    } catch (error) {
      console.error('[Google OAuth] Error in callback:', error);
      res.status(302).set('Location', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed`).send();
    }
  }
);

export default router;