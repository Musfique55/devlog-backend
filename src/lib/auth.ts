import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { APP_ROLE, PLAN } from "../generated/prisma/client/enums";

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
    // emailVerification : {
    //  sendOnSignUp : true,
     
    // }
});