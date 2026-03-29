import { NextFunction, Request, Response } from "express";

export const standupLogBlockerImageUploadMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.body.data) {
    req.body = JSON.parse(req.body.data);
  }

  const files = req.files as Express.Multer.File[];

  if (files && files.length > 0) {
    const imageUrls = files.map((file) => file.path);
    req.body.blockerUrl = imageUrls;
  }
  next();
};
