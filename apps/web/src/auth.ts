import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verifyAdminLogin, type Role } from "@herrglow/core";

declare module "next-auth" {
  interface Session { user: { id: string; role: Role } & DefaultSession["user"] }
  interface User { role?: Role }
}
type Claims = { role?: Role; uid?: string };

// 8 failed/total attempts per email per 15 min (per server instance; move to Redis with the worker)
const attempts = new Map<string, number[]>();
const throttled = (key: string) => {
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter((t) => now - t < 900_000);
  recent.push(now);
  attempts.set(key, recent);
  return recent.length > 8;
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(c) {
        const email = String(c?.email ?? "").toLowerCase().trim();
        const password = String(c?.password ?? "");
        if (!email || !password || throttled(email)) return null;
        const u = await verifyAdminLogin(email, password);
        return u ? { id: u.id, email: u.email, name: u.name, role: u.role } : null;
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/admin/login" },
  trustHost: true,
  callbacks: {
    jwt({ token, user }) {
      if (user) { (token as Claims).role = user.role; (token as Claims).uid = user.id; }
      return token;
    },
    session({ session, token }) {
      session.user.id = (token as Claims).uid ?? "";
      session.user.role = (token as Claims).role ?? "CONTENT";
      return session;
    },
  },
});
