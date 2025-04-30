/*
File: ./back/src/routes/auth.routes.ts
Last change: Added logout endpoint
*/
import express from 'express';
import { registerUser, loginUser, getProfile, logoutUser } from '../controllers/auth.controllers.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Teraz už TS nájde správnu overload (authenticateJWT aj getProfile sú RequestHandler)
router.get('/me', authenticateJWT, getProfile);

export default router;