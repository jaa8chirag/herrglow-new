"use server";

import { revalidatePath } from "next/cache";
import {
  createAdmin,
  resetAdminPassword,
  setAdminActive,
  setAdminRole,
  type Role,
} from "@herrglow/core";
import { log, requireAdmin } from "@/lib/admin";

export type PwState =
  | { status: "idle" }
  | { status: "error"; error: string }
  | { status: "done"; email: string; password: string };
const ROLES: Role[] = ["OWNER", "MANAGER", "CONTENT"];

/** Returns the generated password ONCE (it is stored hashed and never shown again). */
export async function createUserAction(_p: PwState, fd: FormData): Promise<PwState> {
  const me = await requireAdmin("users");
  const email = String(fd.get("email") ?? ""),
    role = String(fd.get("role")) as Role;
  if (!ROLES.includes(role)) return { status: "error", error: "Pick a role" };
  const res = await createAdmin({ email, name: String(fd.get("name") ?? ""), role });
  if (!res.ok) return { status: "error", error: res.error };
  await log(me, "user.create", "AdminUser", email, { role });
  revalidatePath("/admin/users");
  return { status: "done", email, password: res.password! };
}

export async function resetPasswordAction(_p: PwState, fd: FormData): Promise<PwState> {
  const me = await requireAdmin("users");
  const id = String(fd.get("id")),
    email = String(fd.get("email"));
  const res = await resetAdminPassword(id);
  if (!res.ok) return { status: "error", error: res.error };
  await log(me, "user.reset-password", "AdminUser", id);
  return { status: "done", email, password: res.password! };
}

export async function setRoleAction(fd: FormData) {
  const me = await requireAdmin("users");
  const id = String(fd.get("id")),
    role = String(fd.get("role")) as Role;
  if (!ROLES.includes(role)) return;
  const res = await setAdminRole(id, role, me.id);
  if (res.ok) await log(me, "user.role", "AdminUser", id, { role });
  revalidatePath("/admin/users");
}

export async function setActiveAction(fd: FormData) {
  const me = await requireAdmin("users");
  const id = String(fd.get("id")),
    active = fd.get("active") === "1";
  const res = await setAdminActive(id, active, me.id);
  if (res.ok) await log(me, active ? "user.activate" : "user.deactivate", "AdminUser", id);
  revalidatePath("/admin/users");
}
