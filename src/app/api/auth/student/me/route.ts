import { NextResponse } from 'next/server';
import { getStudentSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getStudentSession();
    if (!session) {
      return NextResponse.json({ error: 'Anda belum login.' }, { status: 401 });
    }

    const student = await prisma.student.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        nomor_peserta: true,
        nama_lengkap: true,
        nis: true,
        nisn: true,
        kelas: true,
        rombel: true,
        foto_url: true,
        status: true,
      },
    });

    if (!student || student.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Akun peserta tidak aktif atau tidak ditemukan.' },
        { status: 403 }
      );
    }

    return NextResponse.json({ student });
  } catch (error) {
    console.error('Fetch student session error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
