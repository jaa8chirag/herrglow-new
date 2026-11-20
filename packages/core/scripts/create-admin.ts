/**
 * Creates an admin user.
 *   pnpm --filter @herrglow/core create-admin <email> <OWNER|MANAGER|CONTENT> [password]
 * Without a password a strong random one is generated and printed ONCE.
 */
import { randomBytes } from "node:crypto";
import { prisma } from "@herrglow/db";
import { createAdminUser, type Role } from "../src/admin/auth";

const [email, role = "OWNER", given] = process.argv.slice(2);
if (!email || !["OWNER", "MANAGER", "CONTENT"].includes(role)) { console.error("usage: create-admin <email> <OWNER|MANAGER|CONTENT> [password]"); process.exit(1); }
const password = given ?? randomBytes(12).toString("base64url");
await createAdminUser({ email, role: role as Role, password, name: email.split("@")[0] });
console.log(`created ${role} ${email}${given ? "" : `\npassword (shown once): ${password}`}`);
await prisma.$disconnect();
