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

    // Fetch all sessions & results for this exam
    const sessions = await prisma.examSession.findMany({
      where: { exam_id: targetExam.id },
      include: {
        student: true,
        result: true,
      },
      orderBy: { student: { nomor_peserta: 'asc' } },
    });

    const rows = sessions.map((sess, index) => {
      const res = sess.result;
      return {
        No: index + 1,
        'Nomor Peserta': sess.student.nomor_peserta,
        Nama: sess.student.nama_lengkap,
        Kelas: sess.student.kelas,
        Rombel: sess.student.rombel || '-',
        'Jumlah Soal': res?.total_questions ?? targetExam.jumlah_soal,
        Benar: res?.correct_answers ?? 0,
        Salah: res?.wrong_answers ?? 0,
        Kosong: res?.unanswered ?? 0,
        Nilai: res?.score ?? 0,
        'Waktu Mulai': sess.started_at ? new Date(sess.started_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) : '-',
        'Waktu Selesai': sess.actual_end_at ? new Date(sess.actual_end_at).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) : '-',
        'Durasi (Menit)': res?.duration_used ? Math.ceil(res.duration_used / 60) : '-',
        Status: sess.status,
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
