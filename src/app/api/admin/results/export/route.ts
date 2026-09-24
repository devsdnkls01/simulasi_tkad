import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import * as XLSX from 'xlsx';

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const format = searchParams.get('format') || 'xlsx'; // xlsx or csv
    const examId = searchParams.get('exam_id');

    const targetExam = examId
      ? await prisma.exam.findUnique({ where: { id: examId } })
      : await prisma.exam.findFirst({
          where: { status: 'ACTIVE' },
          orderBy: { created_at: 'desc' },
        });

    if (!targetExam) {
      return NextResponse.json({ error: 'Ujian tidak ditemukan.' }, { status: 404 });
    }

    // Fetch all active students for this exam's class to guarantee 1 unique row per student
    const students = await prisma.student.findMany({
      where: {
        kelas: targetExam.kelas,
        status: 'ACTIVE',
      },
      include: {
        exam_sessions: {
          where: { exam_id: targetExam.id },
          include: {
            result: true,
          },
          orderBy: { created_at: 'desc' },
        },
      },
      orderBy: { nomor_peserta: 'asc' },
    });

    const rows = students.map((student, index) => {
      const completedSessions = student.exam_sessions.filter((s) => s.result !== null);
      const activeSession = student.exam_sessions.find(
        (s) => s.status === 'IN_PROGRESS' || s.status === 'PAUSED'
      );

      // Best session by highest score
      const bestSession =
        completedSessions.length > 0
          ? completedSessions.reduce((prev, curr) => {
              const prevScore = prev.result?.score ?? -1;
              const currScore = curr.result?.score ?? -1;
              return currScore >= prevScore ? curr : prev;
            })
          : null;

      const latestSession = student.exam_sessions[0] || null;
      const res = bestSession?.result;

      let status = 'BELUM_MULAI';
      if (activeSession) {
        status = 'MENGERJAKAN';
      } else if (bestSession) {
        status = 'SELESAI';
      } else if (latestSession) {
        status = latestSession.status;
      }

      return {
        No: index + 1,
        'Nomor Peserta': student.nomor_peserta,
        Nama: student.nama_lengkap,
        Kelas: student.kelas,
        Rombel: student.rombel || '-',
        'Jumlah Soal': res?.total_questions ?? targetExam.jumlah_soal,
        Benar: res?.correct_answers ?? 0,
        Salah: res?.wrong_answers ?? 0,
        Kosong: res?.unanswered ?? (res ? 0 : targetExam.jumlah_soal),
        'Nilai Tertinggi': res?.score ?? 0,
        'Total Percobaan': student.exam_sessions.length,
        'Waktu Selesai': bestSession?.actual_end_at
          ? new Date(bestSession.actual_end_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })
          : '-',
        'Durasi (Menit)': res?.duration_used ? Math.ceil(res.duration_used / 60) : '-',
        Status: status,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Hasil Simulasi TKA');

    const filename = `Hasil_${targetExam.kode_ujian}_${new Date().toISOString().slice(0, 10)}`;

    if (format === 'csv') {
      const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
      return new NextResponse(csvOutput, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}.csv"`,
        },
      });
    }

    // Excel format
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Gagal mengekspor data.' }, { status: 500 });
  }
}
