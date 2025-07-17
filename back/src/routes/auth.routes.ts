// File: back/src/routes/auth.routes.ts
// Last change: Final cleanup, removed all business logic and external dependencies (bcrypt, csurf)

import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { prisma } from '../configs/prisma.config.js';
import { UserRole } from '@prisma/client';
import { registerUser, loginUser, logoutUser, getProfile, setAuthCookie } from '../controllers/auth.controllers.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { setCsrfCookie } from '../middlewares/csrf.middleware.js';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/profile', authenticateJWT, getProfile);

router.get('/csrf-token', (req: Request, res: Response) => {
  const csrfToken = setCsrfCookie(res); 
  res.json({ csrfToken }); 
});

router.get(
  '/google',
  (req: Request, res: Response, next: NextFunction) => {
    const returnTo = req.query.returnTo || '/dashboard';
    (req as any).session.returnTo = returnTo;
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
  }
);

router.get(
  '/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google_failed`
  }),
  (req: Request, res: Response) => {
    try {
      const user = req.user as { id: number; role: UserRole };

      if (!user || !user.id || !user.role) {
        res.status(302).set('Location', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed`).end();
        return;
      }
      
      setAuthCookie(res, user.id, user.role);
      
      const redirectTo = (req as any).session.returnTo || '/dashboard';
      delete (req as any).session.returnTo;

      res.status(302).set('Location', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?status=success&returnTo=${encodeURIComponent(redirectTo)}`).end();
      
    } catch (error) {
      console.error('[Google OAuth] Error in callback:', error);
      res.status(302).set('Location', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed`).end();
    }
  }
);

export default router;