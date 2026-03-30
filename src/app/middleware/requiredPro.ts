import { NextFunction, Request, Response } from "express";
import { PLAN } from "../../generated/prisma/client/enums";
import AppError from "../helper/AppError";
import status from "http-status";

export const requiredPro = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.user?.plan === PLAN.FREE) {
    throw new AppError(
      "This feature is only available for Pro users. Please upgrade your plan to access this feature.",
      status.FORBIDDEN,
    );
  }

  next();
};
