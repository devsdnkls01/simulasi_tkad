import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { logAudit } from '@/lib/audit';

export async function POST() {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [deletedResults, deletedAnswers, deletedSessionQuestions, deletedSessions] =
      await prisma.$transaction([
        prisma.result.deleteMany({}),
        prisma.answer.deleteMany({}),
        prisma.examSessionQuestion.deleteMany({}),
        prisma.examSession.deleteMany({}),
      ]);

    await logAudit({
      action: 'ALL_SCORES_RESET',
      userType: 'ADMIN',
      userId: admin.id,
      details: `Admin ${admin.nama} mereset seluruh nilai, jawaban, dan sesi ujian (${deletedResults.count} hasil, ${deletedSessions.count} sesi).`,
    });

    return NextResponse.json({
      success: true,
      message: 'Seluruh nilai dan riwayat sesi ujian berhasil di-reset.',
      deleted: {
        results: deletedResults.count,
        answers: deletedAnswers.count,
        sessionQuestions: deletedSessionQuestions.count,
        sessions: deletedSessions.count,
      },
    });
  } catch (error) {
    console.error('Reset all scores error:', error);
    return NextResponse.json(
      { error: 'Gagal melakukan reset seluruh nilai.' },
      { status: 500 }
    );
  }
}
