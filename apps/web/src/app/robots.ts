import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { buildRobots } from "@/lib/seo/robots";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = (await headers()).get("host");
  return buildRobots(host);
}
