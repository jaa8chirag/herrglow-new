import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@herrglow/db";
import type { Role } from "./permissions";

export const MIN_PASSWORD = 12;
const generate = () => randomBytes(12).toString("base64url"); // 16 chars

export const listAdmins = () =>
  prisma.adminUser.findMany({ orderBy: [{ active: "desc" }, { createdAt: "asc" }], select: { id: true, email: true, name: true, role: true, active: true, mustChangePassword: true, lastLoginAt: true, createdAt: true } });

export type UserResult = { ok: true; password?: string } | { ok: false; error: string };

async function activeOwners(excludeId?: string) {
  return prisma.adminUser.count({ where: { role: "OWNER", active: true, ...(excludeId ? { id: { not: excludeId } } : {}) } });
}

/** New users get a generated one-time password and must change it on first login. */
export async function createAdmin(i: { email: string; name?: string; role: Role }): Promise<UserResult> {
  const email = i.email.toLowerCase().trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, error: "Enter a valid email address" };
  if (await prisma.adminUser.findUnique({ where: { email } })) return { ok: false, error: "A user with that email already exists" };
  const password = generate();
  await prisma.adminUser.create({ data: { email, name: i.name?.trim() || null, role: i.role, passwordHash: await bcrypt.hash(password, 12), mustChangePassword: true } });
  return { ok: true, password };
}

export async function setAdminRole(id: string, role: Role, actingId: string): Promise<UserResult> {
  if (id === actingId) return { ok: false, error: "You cannot change your own role" };
  const u = await prisma.adminUser.findUnique({ where: { id } });
  if (!u) return { ok: false, error: "User not found" };
  if (u.role === "OWNER" && role !== "OWNER" && u.active && (await activeOwners(id)) === 0) return { ok: false, error: "There must always be at least one active owner" };
  await prisma.adminUser.update({ where: { id }, data: { role } });
  return { ok: true };
}

export async function setAdminActive(id: string, active: boolean, actingId: string): Promise<UserResult> {
  if (id === actingId && !active) return { ok: false, error: "You cannot deactivate yourself" };
  const u = await prisma.adminUser.findUnique({ where: { id } });
  if (!u) return { ok: false, error: "User not found" };
  if (!active && u.role === "OWNER" && (await activeOwners(id)) === 0) return { ok: false, error: "There must always be at least one active owner" };
  await prisma.adminUser.update({ where: { id }, data: { active } });
  return { ok: true };
}

export async function resetAdminPassword(id: string): Promise<UserResult> {
  const password = generate();
  await prisma.adminUser.update({ where: { id }, data: { passwordHash: await bcrypt.hash(password, 12), mustChangePassword: true } });
  return { ok: true, password };
}

export async function changeOwnPassword(id: string, current: string, next: string): Promise<UserResult> {
  const u = await prisma.adminUser.findUnique({ where: { id } });
  if (!u || !(await bcrypt.compare(current, u.passwordHash))) return { ok: false, error: "Current password is incorrect" };
  if (next.length < MIN_PASSWORD) return { ok: false, error: `New password must be at least ${MIN_PASSWORD} characters` };
  if (next === current) return { ok: false, error: "New password must be different" };
  if (!/[a-z]/i.test(next) || !/\d/.test(next)) return { ok: false, error: "Use letters and at least one number" };
  await prisma.adminUser.update({ where: { id }, data: { passwordHash: await bcrypt.hash(next, 12), mustChangePassword: false } });
  return { ok: true };
}

/** Live state used on every admin request, so deactivation and role changes apply immediately (not after the 8h session). */
export const getAdminState = (id: string) => prisma.adminUser.findUnique({ where: { id }, select: { id: true, email: true, name: true, role: true, active: true, mustChangePassword: true } });
