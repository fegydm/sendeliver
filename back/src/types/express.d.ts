// back/src/types/express.d.ts
import { Role } from '@prisma/client';

declare global {
  namespace Express {
    export interface Request {
      user?: {
        userId: number;
        role: Role;
        permissions: string[];
      };
    }
  }
}
