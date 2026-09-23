import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession, hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get('q')?.trim() || '';
    const kelas = searchParams.get('kelas') || '';
    const status = searchParams.get('status') || '';
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Math.min(100, Math.max(10, Number(searchParams.get('limit')) || 25));
    const skip = (page - 1) * limit;

    const where: Prisma.StudentWhereInput = {};
    if (kelas) where.kelas = kelas;
    if (status && (status === 'ACTIVE' || status === 'INACTIVE')) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { nomor_peserta: { contains: search } },
        { nama_lengkap: { contains: search } },
        { nis: { contains: search } },
        { nisn: { contains: search } },
      ];
    }

    const [total, students] = await Promise.all([
      prisma.student.count({ where }),
      prisma.student.findMany({
        where,
        select: {
          id: true,
          nomor_peserta: true,
          nama_lengkap: true,
          nis: true,
          nisn: true,
          kelas: true,
          rombel: true,
          foto_url: true,
          status: true,
          created_at: true,
        },
        orderBy: { nomor_peserta: 'asc' },
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('List students error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    // Check if bulk import
    if (Array.isArray(body.students)) {
      const studentItems = body.students;
      let insertedCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < studentItems.length; i++) {
        const item = studentItems[i];
        if (!item.nomor_peserta || !item.nama_lengkap || !item.password) {
          errors.push(`Baris ${i + 1}: Nomor peserta, nama lengkap, dan password wajib diisi.`);
          continue;
        }

        const trimmedNomor = String(item.nomor_peserta).trim();
        const existing = await prisma.student.findUnique({
          where: { nomor_peserta: trimmedNomor },
        });

        if (existing) {
          errors.push(`Baris ${i + 1}: Nomor peserta ${trimmedNomor} sudah digunakan.`);
          continue;
        }

        const hashed = await hashPassword(String(item.password));
        await prisma.student.create({
          data: {
            nomor_peserta: trimmedNomor,
            nama_lengkap: String(item.nama_lengkap).trim(),
            nis: item.nis ? String(item.nis).trim() : null,
            nisn: item.nisn ? String(item.nisn).trim() : null,
            kelas: item.kelas ? String(item.kelas).trim() : 'VI',
            rombel: item.rombel ? String(item.rombel).trim() : null,
            status: 'ACTIVE',
            password_hash: hashed,
          },
        });
        insertedCount++;
      }

      await logAudit({
        action: 'STUDENT_CREATED',
        userType: 'ADMIN',
        userId: admin.id,
        details: `Import siswa massal: ${insertedCount} siswa berhasil dibuat, ${errors.length} dilewati.`,
      });

      return NextResponse.json({
        success: true,
        insertedCount,
        errors,
      });
    }

    // Single student creation
    const { nomor_peserta, nama_lengkap, nis, nisn, kelas, rombel, password } = body;

    if (!nomor_peserta || !nama_lengkap || !password) {
      return NextResponse.json(
        { error: 'Nomor peserta, nama lengkap, dan password wajib diisi.' },
        { status: 400 }
      );
    }

    const trimmedNomor = String(nomor_peserta).trim();
    const existing = await prisma.student.findUnique({
      where: { nomor_peserta: trimmedNomor },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Nomor peserta ${trimmedNomor} sudah terdaftar.` },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(String(password));

    const student = await prisma.student.create({
      data: {
        nomor_peserta: trimmedNomor,
        nama_lengkap: String(nama_lengkap).trim(),
        nis: nis ? String(nis).trim() : null,
        nisn: nisn ? String(nisn).trim() : null,
        kelas: kelas ? String(kelas).trim() : 'VI',
        rombel: rombel ? String(rombel).trim() : null,
        password_hash: hashedPassword,
        status: 'ACTIVE',
      },
    });

    await logAudit({
      action: 'STUDENT_CREATED',
      userType: 'ADMIN',
      userId: admin.id,
      details: `Menambahkan siswa baru: ${student.nama_lengkap} (${student.nomor_peserta})`,
    });

    return NextResponse.json({
      success: true,
      student: {
        id: student.id,
        nomor_peserta: student.nomor_peserta,
        nama_lengkap: student.nama_lengkap,
        kelas: student.kelas,
        status: student.status,
      },
    });
  } catch (error) {
    console.error('Student create error:', error);
    return NextResponse.json({ error: 'Gagal membuat data siswa.' }, { status: 500 });
  }
}
