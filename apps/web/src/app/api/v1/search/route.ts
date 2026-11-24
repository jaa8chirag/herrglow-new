import { NextResponse } from "next/server";
import { searchGlobalCatalog, recordSearchQuery } from "@herrglow/core";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";

  if (!q) {
    return NextResponse.json({ services: [], packages: [], blogs: [], totalCount: 0 });
  }

  try {
    const results = await searchGlobalCatalog(q, 6);

    // Asynchronously log search queries in analytics (2 chars or longer)
    if (q.length >= 2) {
      recordSearchQuery({
        query: q,
        resultsCount: results.totalCount,
        citySlug: null,
      }).catch((err) => {
        console.error("[search/api] Analytics logging error:", err);
      });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("[api/search] Error querying catalog:", error);
    return NextResponse.json({ error: "Failed to perform search" }, { status: 500 });
  }
}
