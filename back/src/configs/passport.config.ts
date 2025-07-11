// File: back/src/configs/passport.config.ts
// Description: Configures Passport.js with Google OAuth 2.0 Strategy.

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient, UserRole } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({
  path: "../../.env", // Ensure .env is loaded
});

const prisma = new PrismaClient();

/**
 * Initializes Passport.js strategies.
 * This function should be called once when the server starts.
 */
export const configurePassport = () => {
  // Serialize user into the session (not strictly needed if only using JWT in cookie,
  // but good practice for Passport.js setup if sessions are enabled)
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from the session
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Configure Google OAuth 2.0 Strategy
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:10000/api/auth/google/callback',
      scope: ['profile', 'email'] // Request access to user's profile and email
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find user by Google ID
        let user = await prisma.user.findUnique({
          where: { googleId: profile.id }
        });

        if (!user) {
          // If user does not exist, create a new one
          user = await prisma.user.create({
            data: {
              googleId: profile.id,
              email: profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.id}@google.com`, // Fallback email
              displayName: profile.displayName || profile.name?.givenName || 'Google User',
              role: UserRole.individual_user, // Default role for new registrations
              // You might want to set organizationStatus to PENDING_APPROVAL if new users need approval
              organizationStatus: UserRole.individual_user === UserRole.individual_user ? 'NOT_APPLICABLE' : 'PENDING_APPROVAL', // Example logic
            }
          });
          console.log(`[Passport] New user registered via Google: ${user.email}`);
        } else {
          console.log(`[Passport] User logged in via Google: ${user.email}`);
        }

        // Pass the user object to Passport.js
        done(null, user);
      } catch (error) {
        console.error('[Passport] Google Strategy error:', error);
        done(error, undefined); // Pass error to Passport.js
      }
    }
  ));
};
