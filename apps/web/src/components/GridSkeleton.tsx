import { Container } from "@herrglow/ui";

/** Skeleton for listing grids (used inside <Suspense> on pages that can never 404, so status codes stay correct). */
export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <Container className="py-12" aria-busy="true">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-[1.5rem] border border-line bg-white/80">
            <div className="aspect-[4/3] animate-pulse bg-gradient-to-br from-blush-100 to-ivory-deep" />
            <div className="space-y-3 p-5"><div className="h-3 w-20 animate-pulse rounded-full bg-blush-200/70" /><div className="h-5 w-3/4 animate-pulse rounded-full bg-blush-200/70" /><div className="h-4 w-1/3 animate-pulse rounded-full bg-blush-200/50" /></div>
          </div>
        ))}
      </div>
    </Container>
  );
}
