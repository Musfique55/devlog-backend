import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { APP_ROLE, PLAN } from "../generated/prisma/client/enums";
import { bearer } from "better-auth/plugins";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", 
    }),
    emailAndPassword : {
        enabled: true,
        requireEmailVerification : false
    },
    secret: process.env.BETTER_AUTH_SECRET!,
    baseUrl: process.env.BETTER_AUTH_URL!,
    user : {
        additionalFields : {
            role : {
                type : "string",
                defaultValue : APP_ROLE.USER,
            },
            plan : {
                type : "string",
                defaultValue : PLAN.FREE,
            },
        }
    },
    plugins : [
        bearer(),
        
    ],
    session : {
        expiresIn : 60 * 60 * 24, // 24 hours
        updateAge : 60 * 60 * 24, // 24 hours
        cookieCache : {
            enabled : true,
            maxAge : 60 * 60 * 24, // 24 hours
        }
    },
    advanced : {
        useSecureCookies : true,
        cookies : {
            state : {
                attributes : {
                    httpOnly : true,
                    secure : true,
                    sameSite : "none",
                    path : "/"
                }
            },
             sessionToken : {
                attributes : {
                    httpOnly : true,
                    secure : true,
                    sameSite : "none",
                    path : "/"
                }
             }
        }
    }
    
});