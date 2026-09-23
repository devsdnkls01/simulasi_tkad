import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('q') || '').trim();

    if (!query || query.length < 2) {
      return NextResponse.json({ students: [] });
    }

    // Split search into individual words (e.g. "muhammad abid")
    const words = query
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 0);

    // Build AND conditions for each word matching nama_lengkap
    const students = await prisma.student.findMany({
      where: {
        status: 'ACTIVE',
        AND: words.map((word) => ({
          nama_lengkap: {
            contains: word,
            mode: 'insensitive',
          },
        })),
      },
      select: {
        id: true,
        nama_lengkap: true,
        kelas: true,
        rombel: true,
      },
      orderBy: {
        nama_lengkap: 'asc',
      },
      take: 10,
    });

    return NextResponse.json({ students });
  } catch (error) {
    console.error('Student search error:', error);
    return NextResponse.json({ error: 'Gagal mencari nama siswa' }, { status: 500 });
  }
}
