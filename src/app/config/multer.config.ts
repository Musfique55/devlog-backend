import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinaryInstance } from "./cloudinary.config";
import multer from "multer";

const storage = new CloudinaryStorage({
  cloudinary: cloudinaryInstance,
  params: async (req, file) => {
    const originalName = file.originalname;
    const extension = originalName.split(".").pop()?.toLocaleLowerCase();

    const fileNameWithoutExtension = originalName
      .split(".")
      .slice(0, -1)
      .join(".")
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9_]/g, "");

    const uniqueName =
      Math.random().toString(36).substring(2, 8) +
      new Date() +
      "-" +
      fileNameWithoutExtension;

    const folder = extension === "pdf" ? "pdfs" : "images";

    return {
      folder: `devlog-${folder}`,
      public_id: uniqueName,
      resource_type : "auto",
    };
  },
});

export const multerStorage = multer({ storage });
