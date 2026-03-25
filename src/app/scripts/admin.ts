import status from "http-status";
import { APP_ROLE, PLAN } from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import AppError from "../helper/AppError";
import { auth } from "../../lib/auth";

const seedAdmin = async () => {
    const payload = {
        name : process.env.ADMIN_USERNAME as string,
        email : process.env.ADMIN_EMAIL as string,
        password : process.env.ADMIN_PASSWORD as string,
    }  

    const isExist = await prisma.user.findUnique({
        where : {
            email : payload.email,
        }
    });

    if(isExist) {
        throw new AppError('Admin user already exists',status.BAD_REQUEST);
    }

    const admin = await auth.api.signUpEmail({
        body : payload
    });

    if(!admin.user){
        throw new AppError('Failed to create admin user',status.INTERNAL_SERVER_ERROR);
    };

    await prisma.user.update({
        where : {
            email : payload.email
        },
        data : {
            role : APP_ROLE.SUPER_ADMIN,
            emailVerified : true,
            plan : PLAN.PRO
        }
    });

    return admin;

}

seedAdmin();