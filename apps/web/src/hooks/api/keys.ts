/**
 * TanStack Query key factory.
 * Enforces centralized, strictly-typed query keys across the application.
 */
export const queryKeys = {
  services: {
    all: ["services"] as const,
    options: () => [...queryKeys.services.all, "options"] as const,
    detail: (slug: string) => [...queryKeys.services.all, "detail", slug] as const,
  },
  cities: {
    all: ["cities"] as const,
    areas: (citySlug: string) => [...queryKeys.cities.all, citySlug, "areas"] as const,
  },
  admin: {
    all: ["admin"] as const,
    uploads: () => [...queryKeys.admin.all, "uploads"] as const,
  },
} as const;
