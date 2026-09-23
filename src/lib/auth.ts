import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'tka-simulasi-sd-secret-key-super-secure-token-2026'
);

const ADMIN_JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'tka-simulasi-sd-admin-secret-key-super-secure-2026'
);

export const STUDENT_COOKIE_NAME = 'tka_student_token';
export const ADMIN_COOKIE_NAME = 'tka_admin_token';

export interface StudentJwtPayload {
  id: string;
  nomor_peserta: string;
  nama_lengkap: string;
  kelas: string;
  role: 'STUDENT';
}

export interface AdminJwtPayload {
  id: string;
  email: string;
  nama: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'GURU' | 'OPERATOR';
}

// Password hashing
export async function hashPassword(plainText: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainText, salt);
}

export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

// Student JWT
export async function signStudentToken(payload: StudentJwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('12h')
    .sign(JWT_SECRET);
}

export async function verifyStudentToken(token: string): Promise<StudentJwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as StudentJwtPayload;
  } catch {
    return null;
  }
}

// Admin JWT
export async function signAdminToken(payload: AdminJwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(ADMIN_JWT_SECRET);
}

export async function verifyAdminToken(token: string): Promise<AdminJwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, ADMIN_JWT_SECRET);
    return payload as unknown as AdminJwtPayload;
  } catch {
    return null;
  }
}

// Server-side Session Retrievers from Cookies
export async function getStudentSession(): Promise<StudentJwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(STUDENT_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyStudentToken(token);
}

export async function getAdminSession(): Promise<AdminJwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}
