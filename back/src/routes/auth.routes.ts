// File: ./back/src/routes/auth.routes.ts
// Last change: Set up auth endpoints for register, login, and profile

import express from 'express';
import { registerUser, loginUser } from '../controllers/auth.controllers.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected route to get current user profile
router.get('/me', authenticateJWT, async (req, res) => {
  // req.user is guaranteed after authenticateJWT
  return res.json({ 
    userId: req.user!.userId,
    role: req.user!.role,
    permissions: req.user!.permissions
  });
});

export default router;
