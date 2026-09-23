import { NextRequest, NextResponse } from 'next/server';
import { getStudentSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { finalizeExamSession } from '@/lib/scoring';

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
    const autoExpired = body.autoExpired === true;

    // Find student's session
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

    // Determine final status
    const now = new Date();
    const isPastTime = now >= new Date(session.expected_end_at);
    const reason = autoExpired || isPastTime ? 'TIME_EXPIRED' : 'SUBMITTED';

    // Strict validation: if manual submission, all questions MUST be answered
    if (!autoExpired && !isPastTime) {
      const totalCount = await prisma.examSessionQuestion.count({
        where: { session_id: session.id },
      });
      const answeredCount = await prisma.answer.count({
        where: { session_id: session.id, answer: { not: null } },
      });

      if (answeredCount < totalCount) {
        const remaining = totalCount - answeredCount;
        return NextResponse.json(
          {
            error: `Ujian belum dapat dikumpulkan. Masih terdapat ${remaining} butir soal yang belum dijawab. Anda wajib menyelesaikan seluruh soal terlebih dahulu!`,
            unansweredCount: remaining,
          },
          { status: 400 }
        );
      }
    }

    // Calculate score & finalize in database transaction
    const result = await finalizeExamSession(session.id, reason);

    return NextResponse.json({
      success: true,
      message: 'Ujian berhasil diselesaikan.',
      status: reason,
      show_result: session.exam.show_result,
      result: session.exam.show_result
        ? {
            total_questions: result.total_questions,
            correct_answers: result.correct_answers,
            wrong_answers: result.wrong_answers,
            unanswered: result.unanswered,
            score: result.score,
            duration_used: result.duration_used,
          }
        : null,
    });
  } catch (error) {
    console.error('Submit exam error:', error);
    return NextResponse.json({ error: 'Gagal menyelesaikan ujian.' }, { status: 500 });
  }
}
