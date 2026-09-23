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
      return NextResponse.json({ error: 'Anda belum login.' }, { status: 401 });
    }

    const { id: examId } = await params;
    const { token } = await req.json();

    if (!token || String(token).trim().length !== 5 || !/^\d{5}$/.test(String(token).trim())) {
      return NextResponse.json(
        { error: 'Token harus berupa 5 digit angka.' },
        { status: 400 }
      );
    }

    const tokenCode = String(token).trim();

    // Verify student is active
    const student = await prisma.student.findUnique({
      where: { id: studentSession.id },
    });

    if (!student || student.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Peserta tidak aktif. Silakan hubungi admin.' },
        { status: 403 }
      );
    }

    // Verify exam exists and is active
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam || exam.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Ujian tidak aktif atau tidak ditemukan.' },
        { status: 400 }
      );
    }

    // Check student class matches exam
    if (exam.kelas !== student.kelas) {
      return NextResponse.json(
        { error: 'Ujian ini tidak diperuntukkan untuk kelas Anda.' },
        { status: 403 }
      );
    }

    // Check if student has already completed the exam
    const completedSession = await prisma.examSession.findFirst({
      where: {
        exam_id: examId,
        student_id: student.id,
        status: { in: ['SUBMITTED', 'TIME_EXPIRED'] },
      },
    });

    if (completedSession) {
      return NextResponse.json(
        { error: 'Anda sudah menyelesaikan ujian ini.' },
        { status: 400 }
      );
    }

    // Validate 5 digit token from exam_tokens table
    const now = new Date();
    const validToken = await prisma.examToken.findFirst({
      where: {
        exam_id: examId,
        token_code: tokenCode,
        status: 'ACTIVE',
        valid_from: { lte: now },
        valid_until: { gte: now },
      },
    });

    if (!validToken) {
      await logAudit({
        action: 'TOKEN_FAILED',
        userType: 'STUDENT',
        userId: student.id,
        details: `Token salah atau kedaluwarsa untuk ujian ${exam.kode_ujian}: ${tokenCode}`,
      });
      return NextResponse.json(
        { error: 'Token ujian tidak valid atau telah kedaluwarsa.' },
        { status: 400 }
      );
    }

    await logAudit({
      action: 'TOKEN_SUCCESS',
      userType: 'STUDENT',
      userId: student.id,
      details: `Token valid (${tokenCode}) untuk ujian ${exam.kode_ujian}`,
    });

    return NextResponse.json({
      success: true,
      message: 'Token valid.',
      exam: {
        id: exam.id,
        kode_ujian: exam.kode_ujian,
        nama_ujian: exam.nama_ujian,
        mata_pelajaran: exam.mata_pelajaran,
        durasi_menit: exam.durasi_menit,
        jumlah_soal: exam.jumlah_soal,
      },
      tokenId: validToken.id,
    });
  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
