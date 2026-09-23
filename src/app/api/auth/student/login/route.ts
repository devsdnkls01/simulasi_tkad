import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { signStudentToken, STUDENT_COOKIE_NAME } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const studentIdInput = body.student_id;
    const nameInput = body.nama || body.nama_lengkap;
    const nisnInput = body.nisn || body.nomor_peserta;
    const tokenInput = body.token_code || body.token;

    let student = null;

    if (studentIdInput) {
      // 1. Direct ID selection from autocomplete dropdown
      student = await prisma.student.findUnique({
        where: { id: String(studentIdInput) },
      });
    } else if (nameInput) {
      // 2. Name search with multi-word matching
      const query = String(nameInput).trim();
      const words = query
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 0);

      const matchingStudents = await prisma.student.findMany({
        where: {
          status: 'ACTIVE',
          AND: words.map((word) => ({
            nama_lengkap: {
              contains: word,
              mode: 'insensitive',
            },
          })),
        },
      });

      if (matchingStudents.length === 1) {
        student = matchingStudents[0];
      } else if (matchingStudents.length > 1) {
        return NextResponse.json(
          {
            error: `Ditemukan ${matchingStudents.length} siswa dengan nama tersebut. Harap pilih nama lengkap Anda dari daftar pilihan.`,
            suggestions: matchingStudents.map((s) => ({
              id: s.id,
              nama_lengkap: s.nama_lengkap,
              kelas: s.kelas,
            })),
          },
          { status: 400 }
        );
      }
    } else if (nisnInput) {
      // 3. Fallback for NISN / Nomor Peserta / NIS
      const trimmedIdentifier = String(nisnInput).trim();
      student = await prisma.student.findFirst({
        where: {
          OR: [
            { nisn: trimmedIdentifier },
            { nomor_peserta: trimmedIdentifier },
            { nis: trimmedIdentifier },
            { nama_lengkap: trimmedIdentifier },
          ],
        },
      });
    }

    if (!student) {
      const searchKey = nameInput || nisnInput || 'tidak diketahui';
      await logAudit({
        action: 'LOGIN_FAILED',
        userType: 'STUDENT',
        details: `Gagal login dengan kata kunci: ${searchKey} (data siswa tidak ditemukan)`,
      });
      return NextResponse.json(
        { error: 'Nama peserta tidak ditemukan di database. Harap ketik nama dan pilih dari rekomendasi.' },
        { status: 404 }
      );
    }

    if (student.status !== 'ACTIVE') {
      await logAudit({
        action: 'LOGIN_FAILED',
        userType: 'STUDENT',
        userId: student.id,
        details: `Login ditolak karena status: ${student.status}`,
      });
      return NextResponse.json(
        { error: 'Akun peserta tidak aktif. Silakan hubungi proktor/administrator.' },
        { status: 403 }
      );
    }

    // If token is provided, validate token and find target exam
    let matchedExam = null;
    let matchedTokenRecord = null;
    const trimmedToken = tokenInput ? String(tokenInput).trim().toUpperCase() : null;

    if (trimmedToken) {
      const now = new Date();
      matchedTokenRecord = await prisma.examToken.findFirst({
        where: {
          token_code: trimmedToken,
          status: 'ACTIVE',
          valid_until: { gte: now },
        },
        include: {
          exam: true,
        },
      });

      if (!matchedTokenRecord || !matchedTokenRecord.exam || matchedTokenRecord.exam.status !== 'ACTIVE') {
        await logAudit({
          action: 'LOGIN_FAILED',
          userType: 'STUDENT',
          userId: student.id,
          details: `Token ujian salah atau kadaluarsa: ${trimmedToken}`,
        });
        return NextResponse.json(
          { error: `Token ujian "${trimmedToken}" tidak valid atau sudah kadaluarsa. Pastikan token 5-digit sesuai dengan yang diberikan proktor.` },
          { status: 400 }
        );
      }

      matchedExam = matchedTokenRecord.exam;
    }

    // Generate JWT token for student
    const jwtToken = await signStudentToken({
      id: student.id,
      nomor_peserta: student.nomor_peserta,
      nama_lengkap: student.nama_lengkap,
      kelas: student.kelas,
      role: 'STUDENT',
    });

    await logAudit({
      action: 'LOGIN_SUCCESS',
      userType: 'STUDENT',
      userId: student.id,
      details: `Peserta ${student.nama_lengkap} (Kelas: ${student.kelas || 'VI'}) berhasil login ${matchedExam ? `dengan token ${trimmedToken} untuk ${matchedExam.nama_ujian}` : 'ke dashboard'}.`,
    });

    // Check if student has an active ongoing exam session that MUST be finished first
    const ongoingSession = await prisma.examSession.findFirst({
      where: {
        student_id: student.id,
        status: { in: ['IN_PROGRESS', 'PAUSED'] },
      },
      include: {
        exam: true,
      },
    });

    let redirectUrl = matchedExam && matchedTokenRecord
      ? `/exam/${matchedExam.id}/instructions?tokenId=${matchedTokenRecord.id}`
      : '/dashboard';

    let activeExamInfo = matchedExam
      ? {
          id: matchedExam.id,
          kode_ujian: matchedExam.kode_ujian,
          nama_ujian: matchedExam.nama_ujian,
        }
      : null;

    if (ongoingSession && ongoingSession.exam) {
      // Direct student back to their ongoing exam immediately
      redirectUrl = `/exam/${ongoingSession.exam_id}`;
      activeExamInfo = {
        id: ongoingSession.exam.id,
        kode_ujian: ongoingSession.exam.kode_ujian,
        nama_ujian: ongoingSession.exam.nama_ujian,
      };
    }

    const response = NextResponse.json({
      success: true,
      student: {
        id: student.id,
        nomor_peserta: student.nomor_peserta,
        nama_lengkap: student.nama_lengkap,
        kelas: student.kelas,
        rombel: student.rombel,
        nisn: student.nisn,
        nis: student.nis,
        foto_url: student.foto_url,
      },
      exam: activeExamInfo,
      redirectUrl,
      hasOngoingSession: Boolean(ongoingSession),
    });

    response.cookies.set({
      name: STUDENT_COOKIE_NAME,
      value: jwtToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 12, // 12 hours
    });

    return response;
  } catch (error) {
    console.error('Student login error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server saat proses login.' },
      { status: 500 }
    );
  }
}
