import { NextResponse } from 'next/server';
import { getStudentSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const studentSession = await getStudentSession();
    if (!studentSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentSession.id },
    });

    if (!student || student.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Akun peserta tidak aktif' }, { status: 403 });
    }

    // Find active exams matching student's class (or general exams)
    const exams = await prisma.exam.findMany({
      where: {
        status: 'ACTIVE',
        kelas: student.kelas,
      },
      select: {
        id: true,
        kode_ujian: true,
        nama_ujian: true,
        deskripsi: true,
        mata_pelajaran: true,
        kelas: true,
        durasi_menit: true,
        jumlah_soal: true,
        status: true,
      },
      orderBy: { created_at: 'desc' },
    });

    // Check existing session for this student on each exam
    const examIds = exams.map((e) => e.id);
    const existingSessions = await prisma.examSession.findMany({
      where: {
        student_id: student.id,
        exam_id: { in: examIds },
      },
      orderBy: { created_at: 'desc' },
      include: {
        result: {
          select: {
            score: true,
          },
        },
      },
    });

    const sessionByExam = new Map<string, (typeof existingSessions)[0]>();
    for (const s of existingSessions) {
      if (!sessionByExam.has(s.exam_id)) {
        sessionByExam.set(s.exam_id, s);
      } else {
        const current = sessionByExam.get(s.exam_id)!;
        if (
          current.status !== 'IN_PROGRESS' &&
          current.status !== 'PAUSED' &&
          (s.status === 'IN_PROGRESS' || s.status === 'PAUSED')
        ) {
          sessionByExam.set(s.exam_id, s);
        }
      }
    }

    const enrichedExams = exams.map((exam) => {
      const sess = sessionByExam.get(exam.id);
      return {
        ...exam,
        session_status: sess ? sess.status : 'NOT_STARTED',
        session_id: sess?.id || null,
        has_result: !!sess?.result,
        score: sess?.result?.score ?? null,
      };
    });

    return NextResponse.json({ exams: enrichedExams });
  } catch (error) {
    console.error('Available exams error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
