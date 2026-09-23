import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Execute student count, active exam, and class breakdown in parallel
    const [totalStudents, activeStudents, activeExam, studentsByClass] = await Promise.all([
      prisma.student.count(),
      prisma.student.count({ where: { status: 'ACTIVE' } }),
      prisma.exam.findFirst({
        where: { status: 'ACTIVE' },
        include: {
          tokens: {
            where: { status: 'ACTIVE' },
            orderBy: { created_at: 'desc' },
            take: 1,
          },
        },
        orderBy: { created_at: 'desc' },
      }),
      prisma.student.groupBy({
        by: ['kelas'],
        _count: { id: true },
      }),
    ]);

    let notStartedCount = 0;
    let inProgressCount = 0;
    let finishedCount = 0;
    let averageScore = 0;

    if (activeExam) {
      const sessions = await prisma.examSession.findMany({
        where: { exam_id: activeExam.id },
        select: {
          status: true,
          result: { select: { score: true } },
        },
      });

      inProgressCount = sessions.filter((s) => s.status === 'IN_PROGRESS').length;
      finishedCount = sessions.filter(
        (s) => s.status === 'SUBMITTED' || s.status === 'TIME_EXPIRED'
      ).length;
      notStartedCount = Math.max(0, activeStudents - sessions.length);

      const scoredResults = sessions
        .map((s) => s.result?.score)
        .filter((sc): sc is number => typeof sc === 'number');

      if (scoredResults.length > 0) {
        const sum = scoredResults.reduce((acc, curr) => acc + curr, 0);
        averageScore = Number((sum / scoredResults.length).toFixed(1));
      }
    } else {
      notStartedCount = activeStudents;
    }

    return NextResponse.json({
      totalStudents,
      activeStudents,
      activeExam: activeExam
        ? {
            id: activeExam.id,
            kode_ujian: activeExam.kode_ujian,
            nama_ujian: activeExam.nama_ujian,
            mata_pelajaran: activeExam.mata_pelajaran,
            durasi_menit: activeExam.durasi_menit,
            jumlah_soal: activeExam.jumlah_soal,
            active_token: activeExam.tokens[0]?.token_code || null,
          }
        : null,
      stats: {
        notStarted: notStartedCount,
        inProgress: inProgressCount,
        finished: finishedCount,
        averageScore,
      },
      classDistribution: studentsByClass.map((c) => ({
        kelas: c.kelas,
        count: c._count.id,
      })),
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}
