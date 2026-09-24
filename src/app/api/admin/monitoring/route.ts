import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const examId = searchParams.get('exam_id');

    // If no examId provided, use active exam
    const targetExam = examId
      ? await prisma.exam.findUnique({ where: { id: examId } })
      : await prisma.exam.findFirst({
          where: { status: 'ACTIVE' },
          orderBy: { created_at: 'desc' },
        });

    if (!targetExam) {
      return NextResponse.json({ participants: [], total: 0 });
    }

    // Get all students for this exam's class
    const students = await prisma.student.findMany({
      where: {
        kelas: targetExam.kelas,
        status: 'ACTIVE',
      },
      orderBy: { nomor_peserta: 'asc' },
      include: {
        exam_sessions: {
          where: { exam_id: targetExam.id },
          include: {
            answers: {
              where: { answer: { not: null } },
            },
            result: true,
          },
        },
      },
    });

    const now = new Date();

    const participants = students.map((student, index) => {
      // Find active ongoing session if any
      const activeSession = student.exam_sessions.find(
        (s) => s.status === 'IN_PROGRESS' || s.status === 'PAUSED'
      );
      // Get all completed sessions with results
      const completedSessions = student.exam_sessions.filter(
        (s) => s.result !== null
      );

      // Find best session by highest score (if tied, latest completed)
      let bestSession = completedSessions.length > 0
        ? completedSessions.reduce((prev, curr) => {
            const prevScore = prev.result?.score ?? -1;
            const currScore = curr.result?.score ?? -1;
            return currScore >= prevScore ? curr : prev;
          })
        : null;

      const latestSession = student.exam_sessions[0] || null;
      const primarySession = activeSession || bestSession || latestSession;

      let status = 'BELUM_MULAI';
      let progress = `0/${targetExam.jumlah_soal}`;
      let remainingSeconds = 0;
      let startedAt: string | null = null;
      let score: number | null = bestSession?.result?.score ?? null;

      if (activeSession) {
        if (now >= new Date(activeSession.expected_end_at)) {
          status = 'WAKTU_HABIS';
        } else {
          status = 'MENGERJAKAN';
          remainingSeconds = Math.max(
            0,
            Math.floor((new Date(activeSession.expected_end_at).getTime() - now.getTime()) / 1000)
          );
        }
        progress = `${activeSession.answers.length}/${targetExam.jumlah_soal}`;
        startedAt = activeSession.started_at.toISOString();
      } else if (bestSession) {
        status = 'SELESAI';
        progress = `${targetExam.jumlah_soal}/${targetExam.jumlah_soal}`;
        startedAt = bestSession.started_at.toISOString();
      } else if (latestSession) {
        if (latestSession.status === 'SUBMITTED') {
          status = 'SELESAI';
        } else if (latestSession.status === 'TIME_EXPIRED') {
          status = 'WAKTU_HABIS';
        }
        progress = `${latestSession.answers.length}/${targetExam.jumlah_soal}`;
        startedAt = latestSession.started_at.toISOString();
      }

      return {
        no: index + 1,
        studentId: student.id,
        nomorPeserta: student.nomor_peserta,
        nama: student.nama_lengkap,
        kelas: student.kelas,
        rombel: student.rombel,
        sessionId: primarySession?.id || null,
        status,
        progress,
        startedAt,
        remainingSeconds,
        score, // Always highest score across all attempts
        totalAttempts: student.exam_sessions.length,
        lastActivity: primarySession?.last_activity_at || null,
      };
    });

    return NextResponse.json({
      exam: {
        id: targetExam.id,
        nama_ujian: targetExam.nama_ujian,
        kode_ujian: targetExam.kode_ujian,
        durasi_menit: targetExam.durasi_menit,
        jumlah_soal: targetExam.jumlah_soal,
      },
      participants,
      total: participants.length,
      serverTime: now.toISOString(),
    });
  } catch (error) {
    console.error('Monitoring error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
