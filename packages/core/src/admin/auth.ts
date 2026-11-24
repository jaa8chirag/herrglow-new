import bcrypt from "bcryptjs";
import { prisma } from "@herrglow/db";
import type { Role } from "./permissions";

// always run a hash compare, even for unknown users, so response time does not reveal which emails exist
const DUMMY = "$2b$12$C6UzMDM.H6dfI/f/IKcEeO5ZyBl1ZpCDsIHfV7mJ3h6u5uF3WqD0y";

export interface AdminSessionUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
}

export async function verifyAdminLogin(
  email: string,
  password: string
): Promise<AdminSessionUser | null> {
  const u = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase().trim() } });
  const ok = await bcrypt.compare(password, u?.passwordHash ?? DUMMY);
  if (!u || !u.active || !ok) return null;
  await prisma.adminUser.update({ where: { id: u.id }, data: { lastLoginAt: new Date() } });
  return { id: u.id, email: u.email, name: u.name, role: u.role };
}

export async function createAdminUser(i: {
  email: string;
  name?: string;
  password: string;
  role: Role;
}) {
  if (i.password.length < 10) throw new Error("Password must be at least 10 characters");
  const passwordHash = await bcrypt.hash(i.password, 12);
  return prisma.adminUser.create({
    data: { email: i.email.toLowerCase().trim(), name: i.name, passwordHash, role: i.role },
  });
}

export async function audit(
  who: { id?: string; email?: string } | null,
  action: string,
  entity: string,
  entityId?: string,
  meta?: Record<string, unknown>
) {
  await prisma.auditLog.create({
    data: {
      adminId: who?.id,
      adminEmail: who?.email,
      action,
      entity,
      entityId,
      meta: meta as never,
    },
  });
}
