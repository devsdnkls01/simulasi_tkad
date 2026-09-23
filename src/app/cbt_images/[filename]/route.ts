import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const cleanName = path.basename(filename);

    const candidatePaths = [
      path.join(process.cwd(), 'public', 'soal-images', cleanName),
      path.join(process.cwd(), 'public', cleanName),
    ];

    for (const filePath of candidatePaths) {
      if (fs.existsSync(/*turbopackIgnore: true*/ filePath)) {
        const fileBuffer = fs.readFileSync(/*turbopackIgnore: true*/ filePath);
        const ext = path.extname(cleanName).toLowerCase();
        const contentType =
          ext === '.png'
            ? 'image/png'
            : ext === '.jpg' || ext === '.jpeg'
            ? 'image/jpeg'
            : ext === '.svg'
            ? 'image/svg+xml'
            : ext === '.webp'
            ? 'image/webp'
            : 'application/octet-stream';

        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      }
    }

    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  } catch (error) {
    console.error('Image serve error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
