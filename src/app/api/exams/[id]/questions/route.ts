import { NextRequest, NextResponse } from 'next/server';
import { getStudentSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const studentSession = await getStudentSession();
    if (!studentSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: examId } = await params;

    // Get active session (most recent)
    const session = await prisma.examSession.findFirst({
      where: {
        exam_id: examId,
        student_id: studentSession.id,
      },
      orderBy: { created_at: 'desc' },
      include: {
        session_questions: {
          orderBy: { display_order: 'asc' },
          include: {
            question: true,
          },
        },
        answers: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Sesi ujian belum dibuat atau tidak valid.' },
        { status: 404 }
      );
    }

    let sessionQuestions = session.session_questions;

    // Self-healing: If session has 0 questions (e.g. after reseed), populate them automatically
    if (sessionQuestions.length === 0) {
      const exam = await prisma.exam.findUnique({
        where: { id: examId },
        include: { questions: true },
      });
      if (exam && exam.questions.length > 0) {
        const questionList = [...exam.questions];
        if (exam.randomize_questions) {
          for (let i = questionList.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [questionList[i], questionList[j]] = [questionList[j], questionList[i]];
          }
        }
        const targetCount =
          exam.jumlah_soal && exam.jumlah_soal > 0
            ? Math.min(exam.jumlah_soal, questionList.length)
            : questionList.length;
        const selectedQuestions = questionList.slice(0, targetCount);

        await prisma.examSessionQuestion.createMany({
          data: selectedQuestions.map((q, idx) => ({
            session_id: session.id,
            question_id: q.id,
            display_order: idx + 1,
          })),
        });

        sessionQuestions = await prisma.examSessionQuestion.findMany({
          where: { session_id: session.id },
          orderBy: { display_order: 'asc' },
          include: { question: true },
        });
      }
    }

    const now = new Date();

    // Check if server time has exceeded expected_end_at
    if (now >= new Date(session.expected_end_at) && session.status === 'IN_PROGRESS') {
      await prisma.examSession.update({
        where: { id: session.id },
        data: { status: 'TIME_EXPIRED', actual_end_at: now },
      });
      return NextResponse.json(
        {
          error: 'Waktu ujian telah berakhir.',
          status: 'TIME_EXPIRED',
          sessionId: session.id,
        },
        { status: 403 }
      );
    }

    // Build answer lookup map and locked status map
    const answerMap = new Map<string, string>();
    const isFinalMap = new Map<string, boolean>();
    for (const ans of session.answers) {
      if (ans.answer) {
        answerMap.set(ans.question_id, ans.answer);
      }
      if (ans.is_final) {
        isFinalMap.set(ans.question_id, true);
      }
    }

    // Sanitize questions: Include explanation ONLY when question is locked
    const questions = sessionQuestions.map((sq) => {
      const q = sq.question;
      const isLocked = isFinalMap.get(q.id) || false;

      let normalizedImg = q.image_url;
      if (normalizedImg) {
        if (normalizedImg.startsWith('[')) {
          try {
            const parsed = JSON.parse(normalizedImg);
            if (Array.isArray(parsed)) {
              normalizedImg = JSON.stringify(
                parsed.map((img: string) => {
                  if (img.startsWith('http') || img.startsWith('/soal-images/')) return img;
                  return `/soal-images/${img.replace(/^\/+/, '').replace(/^soal-images\//, '')}`;
                })
              );
            }
          } catch {}
        } else if (!normalizedImg.startsWith('http') && !normalizedImg.startsWith('/soal-images/')) {
          normalizedImg = `/soal-images/${normalizedImg.replace(/^\/+/, '').replace(/^soal-images\//, '')}`;
        }
      }

      return {
        id: q.id,
        display_number: sq.display_order,
        question_text: q.question_text,
        image_url: normalizedImg,
        audio_url: q.audio_url,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        saved_answer: answerMap.get(q.id) || null,
        is_locked: isLocked,
        explanation: isLocked ? q.explanation : null,
        correct_answer: isLocked ? q.correct_answer : null,
      };
    });

    return NextResponse.json({
      sessionId: session.id,
      status: session.status,
      started_at: session.started_at,
      expected_end_at: session.expected_end_at,
      server_time: now.toISOString(),
      current_question: session.current_question || 1,
      total_questions: questions.length,
      questions,
    });
  } catch (error) {
    console.error('Fetch exam questions error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
