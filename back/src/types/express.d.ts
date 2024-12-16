// .back/src/types/express.d.ts

import { Request } from "express";

// Extend Express Request type to include 'user'
declare module "express-serve-static-core" {
  interface Request {
    user?: { id: number }; // Adjust type based on your application
  }
}
