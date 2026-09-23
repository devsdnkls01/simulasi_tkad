import { NextRequest, NextResponse } from 'next/server';
import { getStudentSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { logAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const studentSession = await getStudentSession();
    if (!studentSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: examId } = await params;
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'pause'; // 'pause' or 'resume'

    const session = await prisma.examSession.findFirst({
      where: {
        exam_id: examId,
        student_id: studentSession.id,
      },
      include: {
        exam: true,
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Sesi ujian tidak ditemukan.' }, { status: 404 });
    }

    if (session.status === 'SUBMITTED' || session.status === 'TIME_EXPIRED') {
      return NextResponse.json(
        { error: 'Ujian telah berakhir dan tidak dapat dijeda/dilanjutkan.', status: session.status },
        { status: 400 }
      );
    }

    const now = new Date();

    if (action === 'pause') {
      // If already paused, return current status
      if (session.status === 'PAUSED') {
        return NextResponse.json({
          success: true,
          status: 'PAUSED',
          message: 'Ujian sudah dalam status dijeda.',
          expected_end_at: session.expected_end_at,
        });
      }

      // Record pause timestamp in last_activity_at
      await prisma.examSession.update({
        where: { id: session.id },
        data: {
          status: 'PAUSED',
          last_activity_at: now,
        },
      });

      await logAudit({
        action: 'EXAM_PAUSED',
        userType: 'STUDENT',
        userId: studentSession.id,
        details: `Peserta menjeda ujian ${session.exam.nama_ujian} untuk istirahat sejenak.`,
      });

      return NextResponse.json({
        success: true,
        status: 'PAUSED',
        message: 'Ujian berhasil dijeda.',
        paused_at: now.toISOString(),
      });
    }

    if (action === 'resume') {
      let updatedExpectedEndAt = new Date(session.expected_end_at);

      if (session.status === 'PAUSED') {
        // Calculate paused duration between last_activity_at and now
        const pausedAt = new Date(session.last_activity_at).getTime();
        const pauseDurationMs = Math.max(0, now.getTime() - pausedAt);

        // Extend expected_end_at by the pause duration
        updatedExpectedEndAt = new Date(updatedExpectedEndAt.getTime() + pauseDurationMs);
      }

      await prisma.examSession.update({
        where: { id: session.id },
        data: {
          status: 'IN_PROGRESS',
          expected_end_at: updatedExpectedEndAt,
          last_activity_at: now,
        },
      });

      await logAudit({
        action: 'EXAM_RESUMED',
        userType: 'STUDENT',
        userId: studentSession.id,
        details: `Peserta melanjutkan ujian ${session.exam.nama_ujian}.`,
      });

      const remainingSeconds = Math.max(
        0,
        Math.floor((updatedExpectedEndAt.getTime() - now.getTime()) / 1000)
      );

      return NextResponse.json({
        success: true,
        status: 'IN_PROGRESS',
        message: 'Ujian berhasil dilanjutkan.',
        expected_end_at: updatedExpectedEndAt.toISOString(),
        server_time: now.toISOString(),
        remaining_seconds: remainingSeconds,
      });
    }

    return NextResponse.json({ error: 'Aksi tidak dikenal.' }, { status: 400 });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Pause/Resume error:', error);
    return NextResponse.json({ error: 'Gagal memproses jeda ujian.', details: errorMsg }, { status: 500 });
  }
}
