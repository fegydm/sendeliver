// File: back/src/routes/auth.routes.ts
// Last change: Added PATCH /me/role endpoint for updating user's selected role.

import { Router, Request, Response } from 'express';
import passport from 'passport';
import { prisma } from '../configs/prisma.config.js';
import { registerUser, loginUser, logoutUser, getProfile, setAuthCookie } from '../controllers/auth.controllers.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { UserRole } from '@prisma/client';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/profile', authenticateJWT, getProfile);

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
      const user = req.user as { userId: number; role: UserRole };

      if (!user || !user.userId || !user.role) {
        res.status(302).set('Location', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed`).send();
        return;
      }
      
      setAuthCookie(res, user.userId, user.role);
      
      res.status(302).set('Location', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?status=success`).send();
      
    } catch (error) {
      console.error('[Google OAuth] Error in callback:', error);
      res.status(302).set('Location', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed`).send();
    }
  }
);

export default router;
