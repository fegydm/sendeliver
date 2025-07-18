// File: back/src/configs/passport.config.ts
// Last change: Updated Passport strategy to fetch and include memberships in Express.User.

import { PrismaClient, UserRole, UserType, OrgMembershipStatus } from '@prisma/client';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from 'passport';

const prisma = new PrismaClient();

// Extend the Express.User type for Passport.js to include our custom user properties.
declare global {
  namespace Express {
    interface User {
      userId: number;
      userType: UserType;
      primaryRole: UserRole;
      memberships: { organizationId: number; role: UserRole }[];
    }
  }
}

/**
 * Configures Passport.js strategies for authentication.
 */
export const configurePassport = () => {
  // Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Find or create user, including their memberships.
          let user = await prisma.user.findUnique({
            where: { googleId: profile.id },
            include: {
              memberships: {
                where: { status: OrgMembershipStatus.ACTIVE },
                select: { organizationId: true, role: true }
              }
            }
          });

          if (!user) {
            // If user doesn't exist, create a new one as an individual customer.
            user = await prisma.user.create({
              data: {
                email: profile.emails?.[0]?.value as string,
                googleId: profile.id,
                displayName: profile.displayName,
                imageUrl: profile.photos?.[0]?.value,
                primaryRole: UserRole.individual_customer, // Default primary role
                userType: UserType.STANDALONE, // Default user type
              },
              include: {
                memberships: { // Include memberships even if empty for consistency
                  where: { status: OrgMembershipStatus.ACTIVE },
                  select: { organizationId: true, role: true }
                }
              }
            });
          }
          
          // Prepare user data for Passport's done callback.
          const expressUser: Express.User = {
            userId: user.id,
            userType: user.userType,
            primaryRole: user.primaryRole,
            memberships: user.memberships // Pass fetched memberships
          };

          done(null, expressUser);
        } catch (error) {
          console.error('Google OAuth error:', error);
          done(error);
        }
      }
    )
  );

  // Serialize user to store in session (only userId needed for session)
  passport.serializeUser((user: Express.User, done) => {
    done(null, user.userId);
  });

  // Deserialize user from session (fetch full user object from DB with memberships)
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          displayName: true,
          primaryRole: true,
          userType: true,
          imageUrl: true, // Also select imageUrl if needed for profile
          memberships: { // Fetch all active memberships
            where: { status: OrgMembershipStatus.ACTIVE },
            select: { organizationId: true, role: true }
          }
        }
      });

      if (user) {
        // Reconstruct Express.User object from DB data
        const expressUser: Express.User = {
          userId: user.id,
          userType: user.userType,
          primaryRole: user.primaryRole,
          memberships: user.memberships // Pass fetched memberships
        };
        done(null, expressUser);
      } else {
        done(null, false);
      }
    } catch (error) {
      console.error('Deserialize user error:', error);
      done(error);
    }
  });
};