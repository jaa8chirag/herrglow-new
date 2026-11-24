import { prisma } from "@herrglow/db";

export async function listActiveServices(categorySlug?: string) {
  return prisma.service.findMany({
    where: {
      status: "ACTIVE",
      mergedIntoId: null,
      ...(categorySlug ? { categoryId: categorySlug } : {}),
    },
    orderBy: [{ sort: "asc" }, { title: "asc" }],
  });
}
