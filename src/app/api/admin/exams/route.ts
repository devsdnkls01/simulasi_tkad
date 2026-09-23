import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const exams = await prisma.exam.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        _count: {
          select: {
            questions: true,
            exam_sessions: true,
            results: true,
          },
        },
        tokens: {
          where: { status: 'ACTIVE' },
          orderBy: { created_at: 'desc' },
          take: 1,
        },
      },
    });

    return NextResponse.json({ exams });
  } catch (error) {
    console.error('List exams error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      kode_ujian,
      nama_ujian,
      deskripsi,
      mata_pelajaran,
      kelas,
      durasi_menit,
      jumlah_soal,
      status,
      randomize_questions,
      randomize_options,
      show_result,
    } = body;

    if (!kode_ujian || !nama_ujian || !mata_pelajaran || !kelas) {
      return NextResponse.json(
        { error: 'Kode ujian, nama ujian, mata pelajaran, dan kelas wajib diisi.' },
        { status: 400 }
      );
    }

    const exam = await prisma.exam.create({
      data: {
        kode_ujian: String(kode_ujian).trim(),
        nama_ujian: String(nama_ujian).trim(),
        deskripsi: deskripsi ? String(deskripsi).trim() : null,
        mata_pelajaran: String(mata_pelajaran).trim(),
        kelas: String(kelas).trim(),
        durasi_menit: durasi_menit ? Number(durasi_menit) : 105,
        jumlah_soal: jumlah_soal ? Number(jumlah_soal) : 40,
        status: status || 'DRAFT',
        randomize_questions: randomize_questions !== false,
        randomize_options: randomize_options !== false,
        show_result: show_result !== false,
      },
    });

    return NextResponse.json({ success: true, exam });
  } catch (error) {
    console.error('Create exam error:', error);
    return NextResponse.json({ error: 'Gagal membuat ujian.' }, { status: 500 });
  }
}
