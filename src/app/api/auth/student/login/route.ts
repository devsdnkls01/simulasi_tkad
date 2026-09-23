import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { signStudentToken, STUDENT_COOKIE_NAME } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const nisnInput = body.nisn || body.nomor_peserta;
    const tokenInput = body.token_code || body.token;

    if (!nisnInput) {
      return NextResponse.json(
        { error: 'NISN atau Nomor Peserta wajib diisi.' },
        { status: 400 }
      );
    }

    const trimmedIdentifier = String(nisnInput).trim();

    // Find student by NISN, Nomor Peserta, or NIS
    const student = await prisma.student.findFirst({
      where: {
        OR: [
          { nisn: trimmedIdentifier },
          { nomor_peserta: trimmedIdentifier },
          { nis: trimmedIdentifier },
        ],
      },
    });

    if (!student) {
      await logAudit({
        action: 'LOGIN_FAILED',
        userType: 'STUDENT',
        details: `Gagal login dengan NISN/No: ${trimmedIdentifier} (data siswa tidak ditemukan)`,
      });
      return NextResponse.json(
        { error: 'Data siswa dengan NISN / Nomor Peserta tersebut tidak ditemukan.' },
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
      details: `Peserta ${student.nama_lengkap} (NISN: ${student.nisn || '-'}, No: ${student.nomor_peserta}) berhasil login ${matchedExam ? `dengan token ${trimmedToken} untuk ${matchedExam.nama_ujian}` : 'ke dashboard'}.`,
    });

    const redirectUrl = matchedExam && matchedTokenRecord
      ? `/exam/${matchedExam.id}/instructions?tokenId=${matchedTokenRecord.id}`
      : '/dashboard';

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
      exam: matchedExam
        ? {
            id: matchedExam.id,
            kode_ujian: matchedExam.kode_ujian,
            nama_ujian: matchedExam.nama_ujian,
          }
        : null,
      redirectUrl,
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
