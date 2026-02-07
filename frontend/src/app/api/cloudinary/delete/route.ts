import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getCloudinaryPublicId } from '@/src/utils/cloudinaryUrl';

/**
 * POST /api/cloudinary/delete
 * Deletes an image from Cloudinary by URL (server-side; uses API secret).
 * Body: { url: string }
 *
 * Required in .env.local (frontend root): CLOUDINARY_API_SECRET
 * Also uses: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, NEXT_PUBLIC_CLOUDINARY_API_KEY
 */
export async function POST(req: NextRequest) {
  try {
    const apiSecret =
      process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_SECRET;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

    if (!apiSecret || !cloudName || !apiKey) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Server misconfiguration: set CLOUDINARY_API_SECRET (and NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, NEXT_PUBLIC_CLOUDINARY_API_KEY) in .env.local in the frontend folder, then restart the dev server.',
        },
        { status: 500 }
      );
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    const body = await req.json();
    const url = typeof body?.url === 'string' ? body.url : null;
    if (!url) {
      return NextResponse.json(
        { success: false, message: 'Missing url in body' },
        { status: 400 }
      );
    }

    const publicId = getCloudinaryPublicId(url);
    if (!publicId) {
      return NextResponse.json(
        { success: false, message: 'Invalid Cloudinary URL' },
        { status: 400 }
      );
    }

    const result = await cloudinary.uploader.destroy(publicId, { invalidate: true });
    if (result.result === 'not found') {
      return NextResponse.json(
        { success: false, message: 'Image not found in Cloudinary' },
        { status: 404 }
      );
    }
    if (result.result !== 'ok') {
      return NextResponse.json(
        { success: false, message: result.result || 'Delete failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Deleted' });
  } catch (error) {
    console.error('[API /api/cloudinary/delete] Error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
