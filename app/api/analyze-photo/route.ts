import { NextRequest, NextResponse } from 'next/server';
import { analyzeFoodPhoto } from '@/lib/gemini';

// POST /api/analyze-photo — Gemini vision: identify food from image
export async function POST(req: NextRequest) {
  const { base64, mimeType } = await req.json();

  if (!base64 || !mimeType) {
    return NextResponse.json({ error: 'base64 and mimeType required' }, { status: 400 });
  }

  const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!validMimeTypes.includes(mimeType)) {
    return NextResponse.json({ error: 'Unsupported image type' }, { status: 400 });
  }

  try {
    const result = await analyzeFoodPhoto(base64, mimeType);
    return NextResponse.json(result);
  } catch (err) {
    console.error('Gemini vision error:', err);
    return NextResponse.json({ error: 'Photo analysis failed' }, { status: 500 });
  }
}
