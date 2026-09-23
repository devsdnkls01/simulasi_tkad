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

    const session = await prisma.examSession.findFirst({
      where: {
        exam_id: examId,
        student_id: studentSession.id,
      },
      include: {
        exam: true,
        student: true,
        result: true,
        session_questions: {
          include: {
            question: true,
          },
          orderBy: {
            display_order: 'asc',
          },
        },
        answers: true,
      },
    });

    if (!session || !session.result) {
      return NextResponse.json(
        { error: 'Hasil ujian belum tersedia.' },
        { status: 404 }
      );
    }

    const answersMap = new Map<string, string>();
    session.answers.forEach((a) => {
      if (a.answer) {
        answersMap.set(a.question_id, a.answer);
      }
    });

    const reviews = session.session_questions.map((sq, idx) => {
      const q = sq.question;
      const studentAns = answersMap.get(q.id) || null;
      const isCorrect = studentAns === q.correct_answer;
      const isUnanswered = !studentAns;

      return {
        display_number: idx + 1,
        question_text: q.question_text,
        image_url: q.image_url,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        student_answer: studentAns,
        correct_answer: q.correct_answer,
        is_correct: isCorrect,
        is_unanswered: isUnanswered,
      };
    });

    return NextResponse.json({
      success: true,
      show_result: session.exam.show_result,
      student: {
        nama_lengkap: session.student.nama_lengkap,
        nomor_peserta: session.student.nomor_peserta,
        kelas: session.student.kelas,
      },
      exam: {
        nama_ujian: session.exam.nama_ujian,
        mata_pelajaran: session.exam.mata_pelajaran,
      },
      result: session.exam.show_result
        ? {
            total_questions: session.result.total_questions,
            correct_answers: session.result.correct_answers,
            wrong_answers: session.result.wrong_answers,
            unanswered: session.result.unanswered,
            score: session.result.score,
            duration_used: session.result.duration_used,
            finished_at: session.result.finished_at,
          }
        : null,
      reviews: session.exam.show_result ? reviews : [],
    });
  } catch (error) {
    console.error('Fetch student result error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
