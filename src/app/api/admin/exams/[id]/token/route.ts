import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import crypto from 'crypto';

function generateRandom5Digit(): string {
  // Cryptographically random 5-digit number from 10000 to 99999
  const randomNum = crypto.randomInt(10000, 100000);
  const token = String(randomNum);

  // Avoid repetitive/trivial tokens
  const trivial = ['11111', '22222', '33333', '44444', '55555', '66666', '77777', '88888', '99999', '12345', '54321'];
  if (trivial.includes(token)) {
    return generateRandom5Digit();
  }
  return token;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: examId } = await params;
    const body = await req.json().catch(() => ({}));
    const manualToken = body.token_code;
    const validityHours = body.validity_hours ? Number(body.validity_hours) : 4;

    let tokenCode = '';
    if (manualToken) {
      if (!/^\d{5}$/.test(String(manualToken).trim())) {
        return NextResponse.json(
          { error: 'Token manual harus tepat 5 digit angka.' },
          { status: 400 }
        );
      }
      tokenCode = String(manualToken).trim();
    } else {
      tokenCode = generateRandom5Digit();
    }

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      return NextResponse.json({ error: 'Ujian tidak ditemukan.' }, { status: 404 });
    }

    const now = new Date();
    const validUntil = new Date(now.getTime() + validityHours * 60 * 60 * 1000);

    // Deactivate previous active tokens for this exam
    await prisma.examToken.updateMany({
      where: {
        exam_id: examId,
        status: 'ACTIVE',
      },
      data: { status: 'INACTIVE' },
    });

    // Create new token
    const newToken = await prisma.examToken.create({
      data: {
        exam_id: examId,
        token_code: tokenCode,
        status: 'ACTIVE',
        valid_from: now,
        valid_until: validUntil,
        created_by: admin.nama,
      },
    });

    await logAudit({
      action: 'TOKEN_CREATED',
      userType: 'ADMIN',
      userId: admin.id,
      details: `Token baru (${tokenCode}) dibuat untuk ujian ${exam.kode_ujian} berlaku hingga ${validUntil.toISOString()}`,
    });

    return NextResponse.json({
      success: true,
      token: {
        id: newToken.id,
        token_code: newToken.token_code,
        valid_until: newToken.valid_until,
        status: newToken.status,
      },
    });
  } catch (error) {
    console.error('Generate token error:', error);
    return NextResponse.json({ error: 'Gagal membuat token.' }, { status: 500 });
  }
}
