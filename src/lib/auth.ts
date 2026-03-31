import { betterAuth, env } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { APP_ROLE, PLAN } from "../generated/prisma/client/enums";
import { bearer, oAuthProxy } from "better-auth/plugins";
import { sendEmail } from "../app/utils/sendEmail";
import { InviteStatus } from "../generated/prisma/enums";
import { envVars } from "../app/config/env";


export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseUrl: envVars.FRONTEND_URL!,
  trustedOrigins : [envVars.FRONTEND_URL!],
  secret: envVars.BETTER_AUTH_SECRET!,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
        const invitedUser = await prisma.invite.findFirst({
          where : {
            email : user.email,
            status : InviteStatus.PENDING
          },
        })

        if(invitedUser) return;

        await sendEmail({
            to : user.email,
            subject : "email verification link",
            templateName : "emailVerify",
            templateData : {
                name : user.name,
                verifyUrl : url,
            }
        })
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: APP_ROLE.USER,
      },
      plan: {
        type: "string",
        defaultValue: PLAN.FREE,
      },
      currentStreak : {
        type : "number",
        defaultValue : 0,
        required : false
      },
      longestStreak : {
        type : "number",
        defaultValue : 0,
        required : false
      },
      lastLogDate : {
        type : "date",
        defaultValue : null,
        required : false
      },
      isBlocked: {
        type: "boolean",
        defaultValue: false,
        required: false,
      },
      blockedReason: {
        type: "string",
        defaultValue: null,
        required: false,
      },
      blockedAt : {
        type : "date",
        defaultValue : null,
        required : false
      },
      isDeleted: {
        type: "boolean",
        defaultValue: false,
        required: false,
      },
      deletedAt: {
        type: "date",
        defaultValue: null,
        required: false,
      },
    },
  },
  plugins: [bearer(),oAuthProxy()],
  session: {
    expiresIn: 60 * 60 * 24, // 24 hours
    updateAge: 60 * 60 * 24, // 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24, // 24 hours
    },
  },
  advanced: {
    useSecureCookies: true,
    cookies: {
      state: {
        name : "session_token",
        attributes: {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          path: "/",
        },
      },
      sessionToken: {
        name : "session_token",
        attributes: {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          path: "/",
        },
      },
    },
  },
});
