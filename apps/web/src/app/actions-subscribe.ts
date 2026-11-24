"use server";

import { headers } from "next/headers";
import { subscribe } from "@herrglow/core";

export type SubState = { status: "idle" } | { status: "error"; error: string } | { status: "done" };

const hits = new Map<string, number[]>();
const limited = (ip: string) => {
  const n = Date.now();
  const r = (hits.get(ip) ?? []).filter((t) => n - t < 600_000);
  r.push(n);
  hits.set(ip, r);
  return r.length > 5;
};

export async function subscribeAction(_p: SubState, fd: FormData): Promise<SubState> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (limited(ip)) return { status: "error", error: "Too many attempts. Please try again later." };
  const res = await subscribe(String(fd.get("email") ?? ""), String(fd.get("website") ?? ""));
  return res.ok ? { status: "done" } : { status: "error", error: res.error };
}
