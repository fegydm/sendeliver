// File: back/src/routes/contact.messages.routes.ts
// Last change: Refactored to handle public and admin routes internally.

import { Router } from 'express';
import {
  submitContactMessage,
  getAllContactMessages,
  getContactMessageById,
  updateContactMessageStatus,
} from '../controllers/contact.messages.controllers.js';
import { authenticateJWT, checkRole } from '../middlewares/auth.middleware.js';
import { UserRole } from '@prisma/client';

const mainRouter = Router();
const adminRouter = Router();

// --- Admin Routes ---
// These routes will be prefixed with /admin and protected by middleware.
adminRouter.get('/messages', getAllContactMessages);
adminRouter.get('/messages/:id', getContactMessageById);
adminRouter.patch('/messages/:id/status', updateContactMessageStatus);

// --- Public Route ---
// This route is for anyone to submit a message.
mainRouter.post('/submit', submitContactMessage);

// --- Mount Admin Router ---
// Apply authentication and role checks only to the admin sub-router.
mainRouter.use('/admin', authenticateJWT, checkRole(UserRole.org_admin, UserRole.superadmin), adminRouter);

export default mainRouter;
