import { NextFunction, Request, Response } from "express";
import { APP_ROLE, TEAM_ROLE } from "../../generated/prisma/enums";
import { cookieUtils } from "../utils/cookie";
import AppError from "../helper/AppError";
import status from "http-status";
import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../utils/jwt";
import { envVars } from "../config/env";

export interface IRequestUser {
  id: string;
  email: string;
  role: APP_ROLE;
  plan: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: APP_ROLE;
        plan: string;
      };
    }
  }
}

export const checkAuth = (...roles: APP_ROLE[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const sessionToken = cookieUtils.getCookie(
      req,
      "better-auth.session_token",
    );
    if (!sessionToken) {
      throw new AppError(
        "Unauthorized: No session token provided",
        status.UNAUTHORIZED,
      );
    }

    const session = await prisma.session.findFirstOrThrow({
      where: {
        token: sessionToken,
      },
      include: {
        user: true,
      },
    });

    if (session && session.user) {

    const user = session.user;

    const now = new Date();
    const sessionExpiry = new Date(session.createdAt);
    const sessionCreatedAt = new Date(session.createdAt);

    const sessionLife = sessionExpiry.getTime() - sessionCreatedAt.getTime();
    const sessionTimeRemaining = sessionExpiry.getTime() - now.getTime();

    const sessionPercentageRemaining = (sessionTimeRemaining / sessionLife) * 100;

    if (sessionPercentageRemaining <= 20) {
        res.setHeader("X-Session-Expiring-Soon", "true");
        res.setHeader("X-Session-Expires-At", sessionExpiry.toISOString());
        res.setHeader("X-Session-Percentage-Remaining", sessionPercentageRemaining.toString());
    }


      if (roles.length > 0 && !roles.includes(user.role)) {
        throw new AppError(
          "Forbidden: Insufficient permissions",
          status.FORBIDDEN,
        );
      }
    }

    const accessToken = cookieUtils.getCookie(req, "accessToken");
    if (!accessToken) {
      throw new AppError(
        "Unauthorized: No access token provided",
        status.UNAUTHORIZED,
      );
    }

    const verifiedToken = jwtUtils.verifyToken(accessToken, envVars.JWT_SECRET);

    if (!verifiedToken.success) {
      throw new AppError(
        "Unauthorized: Invalid access token",
        status.UNAUTHORIZED,
      );
    }
    req.user = {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
      plan: session.user.plan,
    };
    next();
  };
};
