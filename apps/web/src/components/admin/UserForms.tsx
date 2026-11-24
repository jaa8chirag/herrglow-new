"use client";

import { useActionState } from "react";
import {
  createUserAction,
  resetPasswordAction,
  type PwState,
} from "@/app/admin/(panel)/users/actions";
import { SubmitButton, inputCls } from "./ui";

const Secret = ({ s }: { s: Extract<PwState, { status: "done" }> }) => (
  <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm">
    <p className="font-medium text-amber-900">Temporary password for {s.email} (shown once):</p>
    <p className="mt-1 select-all font-mono text-base text-plum-900">{s.password}</p>
    <p className="mt-1 text-xs text-amber-800">
      Share it securely. They must set their own password at first sign-in.
    </p>
  </div>
);

export function CreateUserForm() {
  const [s, action] = useActionState<PwState, FormData>(createUserAction, { status: "idle" });
  return (
    <div>
      <form action={action} className="grid items-end gap-3 md:grid-cols-[1.4fr_1fr_160px_auto]">
        <label className="grid gap-1.5 text-sm font-medium text-plum-900">
          Email
          <input name="email" type="email" required className={inputCls} />
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-plum-900">
          Name
          <input name="name" className={inputCls} />
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-plum-900">
          Role
          <select name="role" defaultValue="CONTENT" className={inputCls}>
            <option value="CONTENT">Content</option>
            <option value="MANAGER">Manager</option>
            <option value="OWNER">Owner</option>
          </select>
        </label>
        <SubmitButton>Create user</SubmitButton>
      </form>
      {s.status === "error" && <p className="mt-3 text-sm text-rose-700">{s.error}</p>}
      {s.status === "done" && <Secret s={s} />}
    </div>
  );
}

export function ResetPasswordForm({ id, email }: { id: string; email: string }) {
  const [s, action] = useActionState<PwState, FormData>(resetPasswordAction, { status: "idle" });
  return (
    <div>
      <form action={action}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="email" value={email} />
        <SubmitButton variant="ghost" className="!min-h-8 !px-2.5 text-xs">
          Reset password
        </SubmitButton>
      </form>
      {s.status === "error" && <p className="mt-1 text-xs text-rose-700">{s.error}</p>}
      {s.status === "done" && <Secret s={s} />}
    </div>
  );
}
