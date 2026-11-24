import { NextResponse } from "next/server";
import { z } from "zod";
import { recordSearchQuery } from "@herrglow/core";

const SearchLogSchema = z.object({
  query: z.string().min(2).max(100),
  resultsCount: z.number().int().nonnegative(),
  citySlug: z.string().max(50).nullable().optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = SearchLogSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
    }

    await recordSearchQuery({
      query: parsed.data.query,
      resultsCount: parsed.data.resultsCount,
      citySlug: parsed.data.citySlug,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/analytics/search] Error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
