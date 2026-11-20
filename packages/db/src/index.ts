import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/client";

export * from "./generated/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({
      connectionString:
        process.env.DATABASE_URL ?? "postgresql://herrglow:herrglow_dev@localhost:5440/herrglow",
    }),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
