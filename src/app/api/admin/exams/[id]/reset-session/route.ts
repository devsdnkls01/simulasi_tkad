import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { logAudit } from '@/lib/audit';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: examId } = await params;
    const { sessionId, studentId, confirmed, reason } = await req.json();

    if (!confirmed) {
      return NextResponse.json(
        { error: 'Reset sesi harus dikonfirmasi secara eksplisit.' },
        { status: 400 }
      );
    }

    if (!sessionId && !studentId) {
      return NextResponse.json(
        { error: 'Session ID atau Student ID diperlukan.' },
        { status: 400 }
      );
    }

    const session = await prisma.examSession.findFirst({
      where: sessionId
        ? { id: sessionId }
        : { exam_id: examId, student_id: studentId },
      include: {
        student: true,
        exam: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Sesi ujian tidak ditemukan.' },
        { status: 404 }
      );
    }

    // Reset session in a transaction: delete answers, results, and session questions, or delete session
    await prisma.$transaction([
      prisma.answer.deleteMany({ where: { session_id: session.id } }),
      prisma.examSessionQuestion.deleteMany({ where: { session_id: session.id } }),
      prisma.result.deleteMany({ where: { session_id: session.id } }),
      prisma.examSession.delete({ where: { id: session.id } }),
    ]);

    await logAudit({
      action: 'SESSION_RESET',
      userType: 'ADMIN',
      userId: admin.id,
      details: `Admin ${admin.nama} me-reset sesi peserta ${session.student.nama_lengkap} (${session.student.nomor_peserta}) pada ujian ${session.exam.kode_ujian}. Alasan: ${reason || 'Permintaan admin'}`,
    });

    return NextResponse.json({
      success: true,
      message: `Sesi peserta ${session.student.nama_lengkap} berhasil di-reset.`,
    });
  } catch (error) {
    console.error('Reset session error:', error);
    return NextResponse.json({ error: 'Gagal mereset sesi ujian.' }, { status: 500 });
  }
}
