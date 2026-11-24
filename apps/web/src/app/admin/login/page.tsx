import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { getAdminState } from "@herrglow/core";
import { SubmitButton, inputCls, Field } from "@/components/admin/ui";

async function login(fd: FormData) {
  "use server";
  try {
    await signIn("credentials", {
      email: String(fd.get("email") ?? "")
        .trim()
        .toLowerCase(),
      password: String(fd.get("password") ?? ""),
      redirectTo: "/admin",
    });
  } catch (e) {
    if (e instanceof AuthError) redirect("/admin/login?error=1");
    throw e; // NEXT_REDIRECT on success
  }
}

export default async function LoginPage(props: PageProps<"/admin/login">) {
  const sp = await props.searchParams;
  const session = await auth();
  if (session?.user?.id && (await getAdminState(session.user.id))?.active) {
    redirect("/admin");
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-ivory p-6">
      <form
        action={login}
        className="w-full max-w-sm space-y-4 rounded-3xl border border-line bg-white p-8 shadow-soft"
      >
        <div className="text-center pb-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-plum-900 text-ivory font-serif text-2xl font-bold shadow-soft">
            H
          </div>
          <h1 className="mt-3 font-serif text-2xl font-bold text-plum-950">HerrGlow Portal</h1>
          <p className="mt-1 text-xs text-ink-soft">
            Sign in to manage salon bookings, appointments & team
          </p>
        </div>

        <Field label="Email Address">
          <input
            name="email"
            type="email"
            required
            autoComplete="username"
            placeholder="admin@herrglow.com"
            className={inputCls}
          />
        </Field>

        <Field label="Password">
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••••••"
            className={inputCls}
          />
        </Field>

        {sp.error && (
          <p className="rounded-xl bg-rose-50 p-3 text-center text-xs font-medium text-rose-700 ring-1 ring-rose-200">
            Incorrect email or password. Please verify and try again.
          </p>
        )}

        {sp.inactive && (
          <p className="rounded-xl bg-rose-50 p-3 text-center text-xs font-medium text-rose-700 ring-1 ring-rose-200">
            This staff account is currently deactivated.
          </p>
        )}

        <SubmitButton className="w-full !mt-6">Sign In to Dashboard</SubmitButton>
      </form>
    </main>
  );
}
