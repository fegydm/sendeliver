// File: back/src/types/express.d.ts
// Last change: Updated Express types to support both old and new auth systems

import { UserRole, UserType } from '@prisma/client';
import { PermissionSet } from '../services/permissions.service';

declare global {
  namespace Express {
    interface Request {
      // Legacy user format (for compatibility)
      user?: {
        id?: string;
        email?: string;
        role?: string;
        // New auth format
        userId?: number;
        userType?: UserType;
        primaryRole?: UserRole;
        memberships?: { organizationId: number; role: UserRole }[];
      };
      
      // Device type functionality
      organizationId?: number;
      userPermissions?: PermissionSet;
      
      // Existing useragent support
      useragent?: {
        isBoten?: boolean;
        isBot?: boolean;
        browser?: string;
        version?: string;
        os?: string;
        platform?: string;
        source?: string;
      };
    }
  }
}

export {};