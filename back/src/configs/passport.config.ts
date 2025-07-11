// File: back/src/configs/passport.config.ts
// Last change: Fixed session/JWT integration and unified authentication flow

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

export const configurePassport = () => {
  console.log('[Passport Config] GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'NOT SET');
  console.log('[Passport Config] GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'NOT SET');
  console.log('[Passport Config] GOOGLE_CALLBACK_URL:', process.env.GOOGLE_CALLBACK_URL || 'http://localhost:10000/api/auth/google/callback');
  console.log('[Passport Config] SESSION_SECRET:', process.env.SESSION_SECRET ? 'Set' : 'NOT SET');

  // Serialize user - store only essential data
  passport.serializeUser((user: any, done) => {
    // Store the userId for session identification
    done(null, user.userId);
  });

  // Deserialize user - retrieve user data
  passport.deserializeUser(async (userId: number, done) => {
    try {
      // Fetch fresh user data from database
      const user = await prisma.user.findUnique({ where: { id: userId } });
      
      if (user) {
        const expressUser: Express.User = {
          userId: user.id,
          role: user.role,
        };
        done(null, expressUser);
      } else {
        done(null, false);
      }
    } catch (error) {
      console.error('[Passport] Deserialize error:', error);
      done(error, null);
    }
  });

  // Configure Google OAuth 2.0 Strategy
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:10000/api/auth/google/callback',
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await prisma.user.findUnique({
          where: { googleId: profile.id }
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              googleId: profile.id,
              email: profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.id}@google.com`,
              displayName: profile.displayName || profile.name?.givenName || 'Google User',
              role: UserRole.individual_user,
              organizationStatus: UserRole.individual_user === UserRole.individual_user ? 'NOT_APPLICABLE' : 'PENDING_APPROVAL',
            }
          });
          console.log(`[Passport] New user registered via Google: ${user.email}`);
        } else {
          console.log(`[Passport] User logged in via Google: ${user.email}`);
        }

        // Return user data that will be passed to serializeUser
        // This data structure should match what Express.User expects
        const userData = {
          userId: user.id, // Changed from 'id' to 'userId' to match Express.User interface
          role: user.role,
          email: user.email,
          displayName: user.displayName
        };

        done(null, userData);
      } catch (error) {
        console.error('[Passport] Google Strategy callback error:', error);
        done(error, undefined);
      }
    }
  ));
};