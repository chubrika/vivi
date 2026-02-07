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

/**
 * Extract Cloudinary public_id from a Cloudinary URL (for destroy API).
 * Handles URLs with optional folders and transformations.
 * @param url - Full Cloudinary image URL
 * @returns public_id (no file extension) or null if not a Cloudinary URL
 */
export function getCloudinaryPublicId(url: string | undefined | null): string | null {
  if (!url || typeof url !== 'string') return null;
  const cloudinaryPattern = /res\.cloudinary\.com\/[^/]+\/image\/upload\/(?:[^/]+\/)*v\d+\/(.+)/;
  const match = url.match(cloudinaryPattern);
  if (!match) return null;
  const withExt = match[1];
  const withoutExt = withExt.replace(/\.[^.]+$/, '');
  return withoutExt || null;
}

/** Check if a URL is a Cloudinary image URL. */
export function isCloudinaryUrl(url: string | undefined | null): boolean {
  if (!url || typeof url !== 'string') return false;
  return /res\.cloudinary\.com\/[^/]+\/image\/upload\//.test(url);
}

/**
 * Delete an image from Cloudinary by URL (calls Next.js API route).
 * No-op if url is not a Cloudinary URL. Throws on API failure.
 */
export async function deleteCloudinaryImage(url: string): Promise<void> {
  if (!isCloudinaryUrl(url)) return;
  const res = await fetch('/api/cloudinary/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Failed to delete image from Cloudinary');
  }
}

