import { NextRequest, NextResponse } from 'next/server';
import { getStudentSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

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
    const { question_id, answer, is_final, current_question } = await req.json();

    if (!question_id) {
      return NextResponse.json({ error: 'Question ID required' }, { status: 400 });
    }

    const sanitizedAnswer = answer ? String(answer).trim().toUpperCase() : null;
    if (sanitizedAnswer && !['A', 'B', 'C', 'D'].includes(sanitizedAnswer)) {
      return NextResponse.json({ error: 'Jawaban tidak valid.' }, { status: 400 });
    }

    // Find active session
    const session = await prisma.examSession.findFirst({
      where: {
        exam_id: examId,
        student_id: studentSession.id,
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Sesi ujian tidak ditemukan.' }, { status: 404 });
    }

    if (session.status !== 'IN_PROGRESS') {
      return NextResponse.json(
        { error: 'Sesi ujian telah berakhir atau tidak aktif.', status: session.status },
        { status: 403 }
      );
    }

    const now = new Date();
    // Validate server timer
    if (now >= new Date(session.expected_end_at)) {
      await prisma.examSession.update({
        where: { id: session.id },
        data: { status: 'TIME_EXPIRED', actual_end_at: now },
      });
      return NextResponse.json(
        { error: 'Waktu ujian telah berakhir.', status: 'TIME_EXPIRED' },
        { status: 403 }
      );
    }

    // Check if this answer was already finalized / locked
    const existingAnswer = await prisma.answer.findUnique({
      where: {
        session_id_question_id: {
          session_id: session.id,
          question_id,
        },
      },
    });

    if (existingAnswer?.is_final && existingAnswer.answer && existingAnswer.answer !== sanitizedAnswer) {
      return NextResponse.json(
        { error: 'Jawaban untuk soal ini sudah terkunci dan tidak dapat diubah.', is_locked: true },
        { status: 400 }
      );
    }

    const markFinal = Boolean(is_final) || existingAnswer?.is_final || false;

    // Save/Upsert answer atomically
    await prisma.$transaction([
      prisma.answer.upsert({
        where: {
          session_id_question_id: {
            session_id: session.id,
            question_id,
          },
        },
        create: {
          session_id: session.id,
          question_id,
          answer: sanitizedAnswer,
          is_final: markFinal,
          answered_at: now,
        },
        update: {
          answer: sanitizedAnswer,
          is_final: markFinal,
          answered_at: now,
        },
      }),
      prisma.examSession.update({
        where: { id: session.id },
        data: {
          last_activity_at: now,
          current_question: current_question ? Number(current_question) : session.current_question,
        },
      }),
    ]);

    const remainingSeconds = Math.max(
      0,
      Math.floor((new Date(session.expected_end_at).getTime() - now.getTime()) / 1000)
    );

    let explanation: string | null = null;
    let correctAnswer: string | null = null;
    if (markFinal) {
      const qData = await prisma.question.findUnique({
        where: { id: question_id },
        select: { explanation: true, correct_answer: true },
      });
      explanation = qData?.explanation || null;
      correctAnswer = qData?.correct_answer || null;
    }

    return NextResponse.json({
      success: true,
      saved_answer: sanitizedAnswer,
      is_locked: markFinal,
      explanation,
      correct_answer: correctAnswer,
      server_time: now.toISOString(),
      remaining_seconds: remainingSeconds,
    });
  } catch (error) {
    console.error('Autosave answer error:', error);
    return NextResponse.json({ error: 'Gagal menyimpan jawaban.' }, { status: 500 });
  }
}
