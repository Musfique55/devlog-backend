import { NextFunction, Request, Response } from "express";
import { APP_ROLE, TEAM_ROLE } from "../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import AppError from "../helper/AppError";
import status from "http-status";

export const teamAuth = (...roles: TEAM_ROLE[]) => {
 return async (req : Request, res : Response, next:NextFunction) => {
    if(req.user?.role === APP_ROLE.SUPER_ADMIN) return next();

    const teamMember = await prisma.workspaceMember.findUnique({
        where : {
            workspaceId_userId : {
                workspaceId : req.params.workspaceId as string,
                userId : req.user!.id
            }
        },
        include : {
            workspace : true
        }
    });


    if (!teamMember) {
        throw new AppError("Unauthorized",status.UNAUTHORIZED);
    }  


    if(roles.length && !roles.includes(teamMember.role)){
        throw new AppError("Forbidden",status.FORBIDDEN);
    }

    next();
  };
};
