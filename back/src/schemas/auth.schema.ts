// File: /back/src/schemas/auth.schema.ts
import { z } from 'zod';

export const registerUserSchema = z.object({
  // Údaje o používateľovi
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
  displayName: z.string().min(2, { message: "Name is required" }),

  // Voliteľné údaje o firme
  companyName: z.string().min(2).optional(),
  vatNumber: z.string().min(5).optional(),
  companyType: z.enum(['CARRIER', 'FORWARDER', 'CLIENT']).optional(),
});