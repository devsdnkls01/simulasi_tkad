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

    // Group sessions by exam to find active session, latest session, and highest score
    const sessionsByExamId = new Map<string, typeof existingSessions>();
    for (const s of existingSessions) {
      const list = sessionsByExamId.get(s.exam_id) || [];
      list.push(s);
      sessionsByExamId.set(s.exam_id, list);
    }

    const enrichedExams = exams.map((exam) => {
      const studentSessions = sessionsByExamId.get(exam.id) || [];
      const activeSession = studentSessions.find(
        (s) => s.status === 'IN_PROGRESS' || s.status === 'PAUSED'
      );
      const completedScores = studentSessions
        .map((s) => s.result?.score)
        .filter((sc): sc is number => typeof sc === 'number');

      const highestScore =
        completedScores.length > 0 ? Math.max(...completedScores) : null;
      const latestSession = studentSessions[0] || null;
      const primarySession = activeSession || latestSession;

      return {
        ...exam,
        session_status: primarySession ? primarySession.status : 'NOT_STARTED',
        session_id: primarySession?.id || null,
        has_result: completedScores.length > 0,
        score: highestScore, // Always return highest score
        highest_score: highestScore,
        total_attempts: studentSessions.length,
      };
    });

    return NextResponse.json({ exams: enrichedExams });
  } catch (error) {
    console.error('Available exams error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
