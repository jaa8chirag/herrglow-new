import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@herrglow/db", "@herrglow/core", "@herrglow/ui"],
  serverExternalPackages: ["@prisma/client", "pg"],
};

export default nextConfig;
