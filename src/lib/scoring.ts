import { prisma } from './db';
import { logAudit } from './audit';

export interface ScoreCalculationResult {
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  unanswered: number;
  score: number;
  duration_used: number;
}

/**
 * Server-side authoritative scoring calculation.
 * Never trust client scores or answers.
 */
export async function finalizeExamSession(
  sessionId: string,
  reason: 'SUBMITTED' | 'TIME_EXPIRED'
) {
  return await prisma.$transaction(async (tx) => {
    // 1. Fetch current session with lock
    const session = await tx.examSession.findUnique({
      where: { id: sessionId },
      include: {
        exam: {
          include: {
            questions: true,
          },
        },
        answers: true,
        student: true,
      },
    });

    if (!session) {
      throw new Error('Sesi ujian tidak ditemukan.');
    }

    // Idempotency: if already finalized, return existing result
    if (session.status === 'SUBMITTED' || session.status === 'TIME_EXPIRED') {
      const existingResult = await tx.result.findUnique({
        where: { session_id: sessionId },
      });
      if (existingResult) {
        return existingResult;
      }
    }

    const now = new Date();
    const questions = session.exam.questions;
    const totalQuestions = questions.length;

    // Map student answers by question_id
    const answerMap = new Map<string, string>();
    for (const ans of session.answers) {
      if (ans.answer) {
        answerMap.set(ans.question_id, ans.answer.trim().toUpperCase());
      }
    }

    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    for (const q of questions) {
      const studentAns = answerMap.get(q.id);
      if (!studentAns) {
        unansweredCount++;
      } else if (studentAns === q.correct_answer.trim().toUpperCase()) {
        correctCount++;
      } else {
        wrongCount++;
      }
    }

    const score = totalQuestions > 0 ? Number(((correctCount / totalQuestions) * 100).toFixed(2)) : 0;
    const durationUsedSeconds = Math.max(
      0,
      Math.floor((now.getTime() - new Date(session.started_at).getTime()) / 1000)
    );

    // Update Session status
    await tx.examSession.update({
      where: { id: sessionId },
      data: {
        status: reason,
        actual_end_at: now,
        last_activity_at: now,
      },
    });

    // Create or update result
    const result = await tx.result.upsert({
      where: { session_id: sessionId },
      create: {
        session_id: sessionId,
        student_id: session.student_id,
        exam_id: session.exam_id,
        total_questions: totalQuestions,
        correct_answers: correctCount,
        wrong_answers: wrongCount,
        unanswered: unansweredCount,
        score,
        started_at: session.started_at,
        finished_at: now,
        duration_used: durationUsedSeconds,
      },
      update: {
        total_questions: totalQuestions,
        correct_answers: correctCount,
        wrong_answers: wrongCount,
        unanswered: unansweredCount,
        score,
        finished_at: now,
        duration_used: durationUsedSeconds,
      },
    });

    // Record audit log
    await logAudit({
      action: reason === 'TIME_EXPIRED' ? 'EXAM_TIME_EXPIRED' : 'EXAM_SUBMITTED',
      userType: 'STUDENT',
      userId: session.student_id,
      details: `Ujian ${session.exam.kode_ujian} diselesaikan (${reason}). Skor: ${score}`,
    });

    return result;
  });
}
