import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subjectParam = searchParams.get('subject') || 'all';
    const searchQuery = searchParams.get('search')?.trim() || '';

    // Build Prisma query filter
    const whereClause: any = {};

    if (subjectParam !== 'all') {
      if (subjectParam === 'indo') {
        whereClause.exam = { mata_pelajaran: { contains: 'Indonesia', mode: 'insensitive' } };
      } else if (subjectParam === 'matematika') {
        whereClause.exam = { mata_pelajaran: { contains: 'Matematika', mode: 'insensitive' } };
      } else if (subjectParam === 'ipas') {
        whereClause.exam = { mata_pelajaran: { contains: 'IPAS', mode: 'insensitive' } };
      } else if (subjectParam === 'gabungan') {
        whereClause.exam = {
          OR: [
            { mata_pelajaran: { contains: 'Gabungan', mode: 'insensitive' } },
            { nama_ujian: { contains: 'Gabungan', mode: 'insensitive' } },
          ],
        };
      }
    }

    if (searchQuery) {
      whereClause.student = {
        OR: [
          { nama_lengkap: { contains: searchQuery, mode: 'insensitive' } },
          { nomor_peserta: { contains: searchQuery, mode: 'insensitive' } },
          { nisn: { contains: searchQuery, mode: 'insensitive' } },
        ],
      };
    }

    // Query top results from database
    const results = await prisma.result.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            nama_lengkap: true,
            nomor_peserta: true,
            nisn: true,
            kelas: true,
            rombel: true,
          },
        },
        exam: {
          select: {
            nama_ujian: true,
            mata_pelajaran: true,
            kode_ujian: true,
            jumlah_soal: true,
          },
        },
      },
      orderBy: [
        { score: 'desc' },
        { duration_used: 'asc' },
        { finished_at: 'asc' },
      ],
      take: 100,
    });

    // Compute statistical summary
    const totalPeserta = results.length;
    const scores = results.map((r) => r.score);
    const highestScore = totalPeserta > 0 ? Math.max(...scores) : 0;
    const averageScore =
      totalPeserta > 0
        ? Math.round((scores.reduce((a, b) => a + b, 0) / totalPeserta) * 10) / 10
        : 0;
    const tuntasCount = results.filter((r) => r.score >= 70).length;
    const passingRate =
      totalPeserta > 0 ? Math.round((tuntasCount / totalPeserta) * 100) : 0;

    // Format formatted leaderboard with rank assignment
    const formattedResults = results.map((r, index) => {
      // Predicate determination
      let predikat = 'Perlu Peningkatan';
      let predikatColor = 'amber';
      if (r.score >= 90) {
        predikat = 'Sangat Memuaskan (Istimewa)';
        predikatColor = 'emerald';
      } else if (r.score >= 75) {
        predikat = 'Memuaskan (Tuntas)';
        predikatColor = 'blue';
      } else if (r.score >= 60) {
        predikat = 'Cukup (Lulus)';
        predikatColor = 'sky';
      }

      // Format duration (e.g. 15m 30s)
      const minutes = Math.floor(r.duration_used / 60);
      const seconds = r.duration_used % 60;
      const durationFormatted = `${minutes}m ${seconds}d`;

      return {
        id: r.id,
        rank: index + 1,
        studentName: r.student.nama_lengkap,
        kelas: `${r.student.kelas}${r.student.rombel ? ' ' + r.student.rombel : ''}`,
        nisnMasked: r.student.nisn
          ? r.student.nisn.length > 5
            ? `${r.student.nisn.slice(0, 3)}***${r.student.nisn.slice(-3)}`
            : r.student.nisn
          : '—',
        examName: r.exam.nama_ujian,
        subject: r.exam.mata_pelajaran,
        score: Math.round(r.score * 10) / 10,
        correctAnswers: r.correct_answers,
        wrongAnswers: r.wrong_answers,
        totalQuestions: r.total_questions,
        durationFormatted,
        durationSeconds: r.duration_used,
        finishedAt: r.finished_at,
        predikat,
        predikatColor,
      };
    });

    const podium = formattedResults.slice(0, 3);

    return NextResponse.json(
      {
        success: true,
        stats: {
          totalPeserta,
          highestScore,
          averageScore,
          tuntasCount,
          passingRate,
        },
        podium,
        results: formattedResults,
        lastUpdated: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (error: any) {
    console.error('Error fetching public leaderboard:', error);
    return NextResponse.json(
      { error: 'Gagal memuat papan nilai publik', details: error.message },
      { status: 500 }
    );
  }
}
