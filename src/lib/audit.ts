import { prisma } from './db';

export async function logAudit({
  action,
  userType,
  userId,
  details,
  ipAddress,
}: {
  action: string;
  userType: 'STUDENT' | 'ADMIN' | 'SYSTEM';
  userId?: string;
  details?: string;
  ipAddress?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        user_type: userType,
        user_id: userId,
        details,
        ip_address: ipAddress,
      },
    });
  } catch (error) {
    // Audit logging should never crash the primary user flow, but should log to server stdout
    console.error(`[AUDIT_LOG_ERROR] Failed to record audit log (${action}):`, error);
  }
}
