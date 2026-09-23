import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Anda belum login sebagai admin.' }, { status: 401 });
    }

    const admin = await prisma.admin.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        email: true,
        nama: true,
        role: true,
        status: true,
      },
    });

    if (!admin || admin.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Akun admin tidak aktif atau tidak ditemukan.' },
        { status: 403 }
      );
    }

    return NextResponse.json({ admin });
  } catch (error) {
    console.error('Fetch admin session error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
