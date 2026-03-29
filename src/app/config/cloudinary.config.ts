import {v2 as cloudinary} from 'cloudinary';
import { envVars } from './env';
import AppError from '../helper/AppError';

cloudinary.config({
    cloud_name: envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
    api_key: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
    api_secret: envVars.CLOUDINARY.CLOUDINARY_API_SECRET,
});

export  const deleteImageFromCloudinary = async (url: string) => {
    try {
        const regex = /(?:\/v\d+\/)(.+)\.[a-z]{3,4}$/;;
        const match = url.match(regex);
        if (match && match[1]) {
            const publicId = decodeURIComponent(match[1]);
            await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
        } 
    } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
        throw new AppError("Failed to delete image from Cloudinary", 500);
    }
}

export const cloudinaryInstance = cloudinary;