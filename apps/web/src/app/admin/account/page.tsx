import { redirect } from "next/navigation";
import { signOut } from "@/auth";
import { changeOwnPassword, getAdminState, MIN_PASSWORD } from "@herrglow/core";
import { Field, SubmitButton, inputCls } from "@/components/admin/ui";
import { log, requireAdmin } from "@/lib/admin";

async function change(fd: FormData) {
  "use server";
  const me = await requireAdmin(undefined, { allowMustChange: true });
  const next = String(fd.get("next") ?? "");
  if (next !== String(fd.get("confirm") ?? ""))
    redirect("/admin/account?err=" + encodeURIComponent("The two new passwords do not match"));
  const res = await changeOwnPassword(me.id, String(fd.get("current") ?? ""), next);
  if (!res.ok) redirect("/admin/account?err=" + encodeURIComponent(res.error));
  await log(me, "account.password", "AdminUser", me.id);
  redirect("/admin?ok=password");
}

export default async function AccountPage(props: PageProps<"/admin/account">) {
  const me = await requireAdmin(undefined, { allowMustChange: true });
  const state = await getAdminState(me.id);
  const sp = await props.searchParams;
  const err = Array.isArray(sp.err) ? sp.err[0] : sp.err;
  return (
    <main className="grid min-h-dvh place-items-center p-6">
      <form
        action={change}
        className="w-full max-w-md space-y-4 rounded-2xl border border-line bg-white p-8 shadow-lift"
      >
        <p className="font-serif text-2xl text-plum-800">
          {state?.mustChangePassword ? "Set a new password" : "Change password"}
        </p>
        {state?.mustChangePassword && (
          <p className="rounded-lg bg-amber-100 p-3 text-sm text-amber-800">
            You are using a temporary password. Choose your own to continue.
          </p>
        )}
        <p className="text-sm text-ink-soft">Signed in as {me.email}</p>
        <Field label="Current password">
          <input
            name="current"
            type="password"
            required
            autoComplete="current-password"
            className={inputCls}
          />
        </Field>
        <Field label="New password" hint={`at least ${MIN_PASSWORD} characters, with a number`}>
          <input
            name="next"
            type="password"
            required
            minLength={MIN_PASSWORD}
            autoComplete="new-password"
            className={inputCls}
          />
        </Field>
        <Field label="Repeat new password">
          <input
            name="confirm"
            type="password"
            required
            autoComplete="new-password"
            className={inputCls}
          />
        </Field>
        {err && <p className="text-sm text-rose-700">{err}</p>}
        <SubmitButton className="w-full">Save password</SubmitButton>
        <button
          formAction={async () => {
            "use server";
            await signOut({ redirectTo: "/admin/login" });
          }}
          formNoValidate
          className="w-full text-center text-sm text-ink-soft underline"
        >
          Sign out
        </button>
      </form>
    </main>
  );
}
