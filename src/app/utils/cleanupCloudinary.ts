import { Request } from "express";
import { deleteImageFromCloudinary } from "../config/cloudinary.config";

export const cleanupCloudinary = async (req: Request) => {
  try {
    if (req.file && req.file.path) {
        const url = req.file.path;
      await deleteImageFromCloudinary(url);
    }

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      for (const file of req.files as Express.Multer.File[]) {
        const url = file.path;
        await deleteImageFromCloudinary(url);
      }
    }else if(req.files && typeof req.files === 'object') {
        Object.values(req.files).forEach((fileArray) => {
            if (Array.isArray(fileArray)) {
                fileArray.forEach(async (file) => {
                    const url = file.path;
                    await deleteImageFromCloudinary(url);
                });
            }
        });
    }
  } catch (error) {
    console.error("Error during Cloudinary cleanup:", error);
    throw error;
  }
};
