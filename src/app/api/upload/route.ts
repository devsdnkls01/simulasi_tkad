import { NextRequest, NextResponse } from 'next/server';
import { uploadImageToCloudinary } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'tka_simulasi/uploads';
    const publicId = (formData.get('public_id') as string) || undefined;

    if (!file) {
      return NextResponse.json(
        { error: 'Tidak ada file yang dikirimkan' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadImageToCloudinary(buffer, folder, publicId);

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      secure_url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error: any) {
    console.error('Cloudinary Upload API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal mengunggah foto ke Cloudinary' },
      { status: 500 }
    );
  }
}
