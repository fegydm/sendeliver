/*
File: ./back/src/routes/contact.messages.routes.ts
Last change: Fixed imports and typing
*/
import express from 'express';
import {
  submitContactMessage,
  getAllContactMessages,
  getContactMessageById,
  updateContactMessageStatus,
} from '../controllers/contact.messages.controllers.js';

const router = express.Router();

// Public route to submit a contact form message
router.post('/submit', submitContactMessage);

// Admin routes - assume authentication middleware is applied before
router.get('/admin/messages', getAllContactMessages);
router.get('/admin/messages/:id', getContactMessageById);
router.patch('/admin/messages/:id/status', updateContactMessageStatus);

export default router;