// File: back/src/configs/passport.config.ts
// Last change: Applied centralized types and removed local declarations.

import { PrismaClient, UserRole, UserType, OrgMembershipStatus } from '@prisma/client';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import passport from 'passport';

const prisma = new PrismaClient();

export const configurePassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
      },
      async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
        try {
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
            user = await prisma.user.create({
              data: {
                email: profile.emails?.[0]?.value as string,
                googleId: profile.id,
                displayName: profile.displayName,
                imageUrl: profile.photos?.[0]?.value,
                primaryRole: UserRole.individual_customer,
                userType: UserType.STANDALONE,
              },
              include: {
                memberships: {
                  where: { status: OrgMembershipStatus.ACTIVE },
                  select: { organizationId: true, role: true }
                }
              }
            });
          }
          
          const expressUser: Express.User = {
            userId: user.id,
            email: user.email,
            userType: user.userType,
            primaryRole: user.primaryRole,
            memberships: user.memberships
          };

          done(null, expressUser);
        } catch (error) {
          console.error('Google OAuth error:', error);
          done(error as Error);
        }
      }
    )
  );

  passport.serializeUser((user: Express.User, done: (err: any, id?: number) => void) => {
    done(null, user.userId);
  });

  passport.deserializeUser(async (id: number, done: (err: any, user?: Express.User | false | null) => void) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          displayName: true,
          primaryRole: true,
          userType: true,
          imageUrl: true,
          memberships: {
            where: { status: OrgMembershipStatus.ACTIVE },
            select: { organizationId: true, role: true }
          }
        }
      });

      if (user) {
        const expressUser: Express.User = {
          userId: user.id,
          email: user.email,
          userType: user.userType,
          primaryRole: user.primaryRole,
          memberships: user.memberships
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
