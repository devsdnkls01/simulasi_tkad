import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword, signAdminToken, ADMIN_COOKIE_NAME } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const identifier = email || (await req.json().catch(() => ({})))?.username;
    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Username dan password wajib diisi.' },
        { status: 400 }
      );
    }

    const trimmedIdentifier = String(identifier).trim().toLowerCase();
    const admin = await prisma.admin.findUnique({
      where: { email: trimmedIdentifier },
    });

    if (!admin || admin.status !== 'ACTIVE') {
      await logAudit({
        action: 'ADMIN_LOGIN_FAILED',
        userType: 'ADMIN',
        details: `Gagal login admin dengan username/email: ${trimmedIdentifier}`,
      });
      return NextResponse.json(
        { error: 'Username atau password proktor/administrator salah.' },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, admin.password_hash);
    if (!isMatch) {
      await logAudit({
        action: 'ADMIN_LOGIN_FAILED',
        userType: 'ADMIN',
        userId: admin.id,
        details: `Password salah untuk: ${trimmedIdentifier}`,
      });
      return NextResponse.json(
        { error: 'Username atau password proktor/administrator salah.' },
        { status: 401 }
      );
    }

    const token = await signAdminToken({
      id: admin.id,
      email: admin.email,
      nama: admin.nama,
      role: admin.role as 'ADMIN' | 'SUPER_ADMIN' | 'GURU' | 'OPERATOR',
    });

    await logAudit({
      action: 'ADMIN_LOGIN',
      userType: 'ADMIN',
      userId: admin.id,
      details: `Administrator ${admin.nama} (${admin.email}) berhasil login.`,
    });

    const response = NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        nama: admin.nama,
        role: admin.role,
      },
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8, // 8 hours
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}
