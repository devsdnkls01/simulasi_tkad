import { NextRequest, NextResponse } from 'next/server';
import { getStudentSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { logAudit } from '@/lib/audit';

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
    const tokenId = body.tokenId;

    const student = await prisma.student.findUnique({
      where: { id: studentSession.id },
    });

    if (!student || student.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Peserta tidak aktif.' }, { status: 403 });
    }

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: true,
      },
    });

    if (!exam || exam.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Ujian tidak aktif.' }, { status: 400 });
    }

    // Check if an existing session already exists for this student & exam
    const existingSession = await prisma.examSession.findFirst({
      where: {
        exam_id: examId,
        student_id: student.id,
      },
      include: {
        session_questions: {
          orderBy: { display_order: 'asc' },
        },
      },
    });

    const now = new Date();

    if (existingSession) {
      // If already finished, block
      if (
        existingSession.status === 'SUBMITTED' ||
        existingSession.status === 'TIME_EXPIRED'
      ) {
        return NextResponse.json(
          {
            error: 'Ujian telah selesai.',
            sessionId: existingSession.id,
            status: existingSession.status,
          },
          { status: 400 }
        );
      }

      // Check if time expired on server
      if (now >= new Date(existingSession.expected_end_at)) {
        await prisma.examSession.update({
          where: { id: existingSession.id },
          data: { status: 'TIME_EXPIRED', actual_end_at: now },
        });
        return NextResponse.json(
          {
            error: 'Waktu ujian telah habis.',
            sessionId: existingSession.id,
            status: 'TIME_EXPIRED',
          },
          { status: 400 }
        );
      }

      // Resume ongoing session without resetting timer!
      return NextResponse.json({
        success: true,
        isResumed: true,
        sessionId: existingSession.id,
        started_at: existingSession.started_at,
        expected_end_at: existingSession.expected_end_at,
        server_time: now.toISOString(),
        total_questions: exam.questions.length,
      });
    }

    // Create NEW exam session with authoritative server-side timestamps
    const durationMs = (exam.durasi_menit || 105) * 60 * 1000;
    const startedAt = now;
    const expectedEndAt = new Date(startedAt.getTime() + durationMs);

    // Prepare question ordering and random selection from bank
    const questionList = [...exam.questions];
    if (exam.randomize_questions) {
      // Fisher-Yates shuffle
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

    const session = await prisma.$transaction(async (tx) => {
      const newSession = await tx.examSession.create({
        data: {
          exam_id: exam.id,
          student_id: student.id,
          token_id: tokenId || null,
          started_at: startedAt,
          expected_end_at: expectedEndAt,
          status: 'IN_PROGRESS',
        },
      });

      // Insert question mappings for deterministic order in this session
      const sessionQuestionsData = selectedQuestions.map((q, index) => ({
        session_id: newSession.id,
        question_id: q.id,
        display_order: index + 1,
      }));

      await tx.examSessionQuestion.createMany({
        data: sessionQuestionsData,
      });

      return newSession;
    });

    await logAudit({
      action: 'EXAM_STARTED',
      userType: 'STUDENT',
      userId: student.id,
      details: `Memulai ujian ${exam.kode_ujian} (${exam.nama_ujian}) dengan durasi ${exam.durasi_menit} menit (${selectedQuestions.length} butir soal).`,
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      started_at: startedAt.toISOString(),
      expected_end_at: expectedEndAt.toISOString(),
      server_time: now.toISOString(),
      total_questions: selectedQuestions.length,
    });
  } catch (error) {
    console.error('Start exam session error:', error);
    return NextResponse.json({ error: 'Gagal memulai ujian.' }, { status: 500 });
  }
}
