// File: back/src/types/express.d.ts
// Last change: Centralized and corrected the Express Request type extensions.

import { UserRole, UserType } from '@prisma/client';

declare global {
  namespace Express {
    interface User {
      userId: number;
      email: string; // This was the missing property
      userType: UserType;
      primaryRole: UserRole;
      memberships: { organizationId: number; role: UserRole }[];
    }

    interface Request {
      user?: User;
    }
  }
}
