import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { audit, can, type Perm, type Role } from "@herrglow/core";

export interface Admin { id: string; email: string; name: string | null; role: Role }

/**
 * Server-side gate for admin pages AND server actions. Call it first in every one:
 * UI hiding is not security, so each action re-checks the role.
 */
export async function requireAdmin(perm?: Perm): Promise<Admin> {
  const s = await auth();
  if (!s?.user?.id) redirect("/admin/login");
  const role = s.user.role;
  if (perm && !can(role, perm)) redirect("/admin?denied=" + perm);
  return { id: s.user.id, email: s.user.email ?? "", name: s.user.name ?? null, role };
}

export const log = (a: Admin, action: string, entity: string, entityId?: string, meta?: Record<string, unknown>) => audit({ id: a.id, email: a.email }, action, entity, entityId, meta);
