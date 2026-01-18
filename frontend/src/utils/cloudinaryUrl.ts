/**
 * Client-side utility functions for Cloudinary URL transformations
 * This file is safe to use in client components (no Node.js dependencies)
 */

/**
 * Transforms a Cloudinary URL to use thumbnail transformations
 * @param url - The original Cloudinary URL
 * @param width - Thumbnail width (default: 400)
 * @param height - Thumbnail height (default: 400)
 * @returns The transformed URL with thumbnail transformations, or original URL if not a Cloudinary URL
 */
export function getCloudinaryThumbnail(
  url: string | undefined | null,
  width: number = 200,
  height: number = 200
): string {
  if (!url) {
    return "https://via.placeholder.com/400";
  }

  // Check if it's a Cloudinary URL
  const cloudinaryPattern = /(https?:\/\/res\.cloudinary\.com\/[^\/]+\/image\/upload\/)(v\d+\/)(.+)/;
  const match = url.match(cloudinaryPattern);

  if (match) {
    // Insert thumbnail transformation between /upload/ and version
    const baseUrl = match[1];
    const version = match[2];
    const publicId = match[3];
    const transformation = `w_${width},h_${height},c_thumb`;
    
    return `${baseUrl}${transformation}/${version}${publicId}`;
  }

  // If not a Cloudinary URL, return as is
  return url;
}

