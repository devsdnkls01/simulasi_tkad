import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession, hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { logAudit } from '@/lib/audit';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: studentId } = await params;
    const body = await req.json();

    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json({ error: 'Siswa tidak ditemukan.' }, { status: 404 });
    }

    const updateData: Prisma.StudentUpdateInput = {};
    if (body.nama_lengkap) updateData.nama_lengkap = String(body.nama_lengkap).trim();
    if (body.kelas) updateData.kelas = String(body.kelas).trim();
    if (body.rombel !== undefined) updateData.rombel = body.rombel ? String(body.rombel).trim() : null;
    if (body.nis !== undefined) updateData.nis = body.nis ? String(body.nis).trim() : null;
    if (body.nisn !== undefined) updateData.nisn = body.nisn ? String(body.nisn).trim() : null;
    if (body.status && ['ACTIVE', 'INACTIVE'].includes(body.status)) updateData.status = body.status;

    // Reset password if provided
    if (body.password && String(body.password).trim().length > 0) {
      updateData.password_hash = await hashPassword(String(body.password));
    }

    const updated = await prisma.student.update({
      where: { id: studentId },
      data: updateData,
    });

    await logAudit({
      action: 'STUDENT_UPDATED',
      userType: 'ADMIN',
      userId: admin.id,
      details: `Update data siswa ${updated.nama_lengkap} (${updated.nomor_peserta}). Status: ${updated.status}`,
    });

    return NextResponse.json({
      success: true,
      student: {
        id: updated.id,
        nomor_peserta: updated.nomor_peserta,
        nama_lengkap: updated.nama_lengkap,
        kelas: updated.kelas,
        status: updated.status,
      },
    });
  } catch (error) {
    console.error('Update student error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui siswa.' }, { status: 500 });
  }
}
