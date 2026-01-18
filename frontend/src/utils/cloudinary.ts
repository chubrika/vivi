import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
// NOTE: This file is for server-side use only (uses Node.js modules)
// For client-side URL transformations, use cloudinaryUrl.ts instead
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export default cloudinary; 