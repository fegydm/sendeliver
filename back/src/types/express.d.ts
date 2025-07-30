// File: back/src/types/express.d.ts
// Last change: Consolidated all type definitions

// Add missing modules
declare module 'passport';
declare module 'passport-google-oauth20';
declare module 'pg';
declare module 'ws';
declare module 'jsonwebtoken';
declare module 'nodemailer';
declare module 'cors';
declare module '@sendeliver/logger';

// Express extensions
declare global {
  namespace Express {
    interface Request {
      // Auth system
      user?: {
        id?: string;
        userId?: number;
        email?: string;
        role?: string;
        primaryRole?: UserRole;
        userType?: UserType;
        memberships?: { organizationId: number; role: UserRole }[];
      };
      
      // Permissions
      organizationId?: number;
      userPermissions?: PermissionSet;
      
      // User agent
      useragent?: {
        isBoten?: boolean;
      };
      
      // Session/cookies
      cookies: Record<string, string>;
      session: any;
    }
  }
}