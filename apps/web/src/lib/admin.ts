import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { audit, can, getAdminState, type Perm, type Role } from "@herrglow/core";

export interface Admin {
  id: string;
  email: string;
  name: string | null;
  role: Role;
}

/**
 * Server-side gate for admin pages AND server actions. Call it first in every one.
 * It reads the user's CURRENT state from the database, so deactivation and role changes apply immediately
 * (not after the 8-hour session), and a user flagged "must change password" cannot use anything else until they do.
 */
export async function requireAdmin(
  perm?: Perm,
  opts: { allowMustChange?: boolean } = {}
): Promise<Admin> {
  const s = await auth();
  if (!s?.user?.id) redirect("/admin/login");
  const u = await getAdminState(s.user.id);
  if (!u || !u.active) redirect("/admin/login?inactive=1");
  if (u.mustChangePassword && !opts.allowMustChange) redirect("/admin/account");
  if (perm && !can(u.role, perm)) redirect("/admin?denied=" + perm);
  return { id: u.id, email: u.email, name: u.name, role: u.role };
}

export const log = (
  a: Admin,
  action: string,
  entity: string,
  entityId?: string,
  meta?: Record<string, unknown>
) => audit({ id: a.id, email: a.email }, action, entity, entityId, meta);
