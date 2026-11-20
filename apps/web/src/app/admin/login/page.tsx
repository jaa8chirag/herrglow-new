import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { SubmitButton, inputCls, Field } from "@/components/admin/ui";

async function login(fd: FormData) {
  "use server";
  try {
    await signIn("credentials", { email: String(fd.get("email") ?? ""), password: String(fd.get("password") ?? ""), redirectTo: "/admin" });
  } catch (e) {
    if (e instanceof AuthError) redirect("/admin/login?error=1");
    throw e; // NEXT_REDIRECT on success
  }
}

export default async function LoginPage(props: PageProps<"/admin/login">) {
  if ((await auth())?.user) redirect("/admin");
  const sp = await props.searchParams;
  return (
    <main className="grid min-h-dvh place-items-center p-6">
      <form action={login} className="w-full max-w-sm space-y-4 rounded-2xl border border-line bg-white p-8 shadow-lift">
        <p className="font-serif text-2xl text-plum-800">HerrGlow Admin</p>
        <Field label="Email"><input name="email" type="email" required autoComplete="username" className={inputCls} /></Field>
        <Field label="Password"><input name="password" type="password" required autoComplete="current-password" className={inputCls} /></Field>
        {sp.error && <p className="text-sm text-rose-700">Incorrect email or password.</p>}
        <SubmitButton className="w-full">Sign in</SubmitButton>
      </form>
    </main>
  );
}
