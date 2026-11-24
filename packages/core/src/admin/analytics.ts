import { prisma } from "@herrglow/db";

export interface LogSearchParams {
  query: string;
  resultsCount: number;
  citySlug?: string | null;
}

export interface ServiceViewSummary {
  id: string;
  slug: string;
  title: string;
  categoryName: string;
  categorySlug: string;
  viewCount: number;
  leadCount: number;
  conversionRate: number;
  image: string | null;
  price: number | null;
  offerPrice: number | null;
}

export interface SearchQuerySummary {
  query: string;
  count: number;
  avgResults: number;
  lastSearchedAt: Date;
}

export interface AnalyticsOverview {
  topServices: ServiceViewSummary[];
  topSearches: SearchQuerySummary[];
  zeroResultSearches: SearchQuerySummary[];
  recentSearches: {
    id: string;
    query: string;
    resultsCount: number;
    citySlug: string | null;
    createdAt: Date;
  }[];
  stats: {
    totalViews: number;
    totalSearches: number;
    zeroResultCount: number;
    zeroResultRate: number;
    topConvertingService: string | null;
  };
}

/**
 * Logs a user search query asynchronously without blocking the user response.
 */
export async function recordSearchQuery({
  query,
  resultsCount,
  citySlug,
}: LogSearchParams): Promise<void> {
  const normalized = query.trim().toLowerCase().slice(0, 100);
  if (normalized.length < 2) return;

  try {
    await prisma.searchQueryLog.create({
      data: {
        query: normalized,
        resultsCount: Math.max(0, resultsCount),
        citySlug: citySlug ? citySlug.trim().toLowerCase().slice(0, 50) : null,
      },
    });
  } catch (error) {
    // Non-blocking catch to ensure UI never fails due to analytics logging
    console.error("[analytics] Failed to log search query:", error);
  }
}

/**
 * Increments page view counter for a service, updating both all-time and daily totals.
 */
export async function recordServiceView(serviceId: string, isBot = false): Promise<void> {
  if (!serviceId || isBot) return;

  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    await Promise.all([
      prisma.service.update({
        where: { id: serviceId },
        data: { viewCount: { increment: 1 } },
      }),
      prisma.serviceDailyView.upsert({
        where: {
          serviceId_date: {
            serviceId,
            date: today,
          },
        },
        update: { views: { increment: 1 } },
        create: {
          serviceId,
          date: today,
          views: 1,
        },
      }),
    ]);
  } catch (error) {
    console.error("[analytics] Failed to record service view:", error);
  }
}

/**
 * Retrieves aggregate demand and user search intelligence for the Admin Dashboard.
 */
export async function getAnalyticsOverview(days = 30): Promise<AnalyticsOverview> {
  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - days);

  const [services, recentSearches, allLogs] = await Promise.all([
    prisma.service.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        slug: true,
        title: true,
        image: true,
        price: true,
        offerPrice: true,
        viewCount: true,
        leadCount: true,
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { viewCount: "desc" },
      take: 20,
    }),
    prisma.searchQueryLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 25,
      select: {
        id: true,
        query: true,
        resultsCount: true,
        citySlug: true,
        createdAt: true,
      },
    }),
    prisma.searchQueryLog.findMany({
      where: { createdAt: { gte: sinceDate } },
      select: {
        query: true,
        resultsCount: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 2000,
    }),
  ]);

  // Aggregate search queries by count and average results
  const searchMap = new Map<
    string,
    { count: number; totalResults: number; lastSearchedAt: Date }
  >();
  let totalZeroResults = 0;

  for (const log of allLogs) {
    if (log.resultsCount === 0) totalZeroResults++;

    const existing = searchMap.get(log.query);
    if (!existing) {
      searchMap.set(log.query, {
        count: 1,
        totalResults: log.resultsCount,
        lastSearchedAt: log.createdAt,
      });
    } else {
      existing.count += 1;
      existing.totalResults += log.resultsCount;
      if (log.createdAt > existing.lastSearchedAt) {
        existing.lastSearchedAt = log.createdAt;
      }
    }
  }

  const aggregatedSearches: SearchQuerySummary[] = Array.from(searchMap.entries()).map(
    ([query, data]) => ({
      query,
      count: data.count,
      avgResults: Math.round(data.totalResults / data.count),
      lastSearchedAt: data.lastSearchedAt,
    })
  );

  aggregatedSearches.sort((a, b) => b.count - a.count);

  const topSearches = aggregatedSearches.slice(0, 10);
  const zeroResultSearches = aggregatedSearches.filter((s) => s.avgResults === 0).slice(0, 10);

  // Map service view summaries and conversion rates
  const topServices: ServiceViewSummary[] = services.map((s) => {
    const views = s.viewCount;
    const leads = s.leadCount;
    const conversionRate = views > 0 ? Number(((leads / views) * 100).toFixed(1)) : 0;

    return {
      id: s.id,
      slug: s.slug,
      title: s.title,
      categoryName: s.category.name,
      categorySlug: s.category.slug,
      viewCount: views,
      leadCount: leads,
      conversionRate,
      image: s.image,
      price: s.price ? Number(s.price) : null,
      offerPrice: s.offerPrice ? Number(s.offerPrice) : null,
    };
  });

  const totalViews = topServices.reduce((sum, s) => sum + s.viewCount, 0);
  const totalSearches = allLogs.length;
  const zeroResultRate =
    totalSearches > 0 ? Number(((totalZeroResults / totalSearches) * 100).toFixed(1)) : 0;

  const topConverting = [...topServices]
    .filter((s) => s.viewCount >= 5)
    .sort((a, b) => b.conversionRate - a.conversionRate)[0];

  return {
    topServices: topServices.slice(0, 10),
    topSearches,
    zeroResultSearches,
    recentSearches,
    stats: {
      totalViews,
      totalSearches,
      zeroResultCount: totalZeroResults,
      zeroResultRate,
      topConvertingService: topConverting
        ? `${topConverting.title} (${topConverting.conversionRate}%)`
        : null,
    },
  };
}
