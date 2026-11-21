"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./keys";

export interface ServiceOption {
  slug: string;
  title: string;
  category: string;
}

async function fetchServiceOptions(): Promise<ServiceOption[]> {
  const res = await fetch("/api/v1/service-options");
  if (!res.ok) {
    throw new Error(`Failed to load service options (status ${res.status})`);
  }
  return res.json();
}

/**
 * Hook to fetch and cache service picker options via TanStack Query.
 */
export function useServiceOptions(options?: { enabled?: boolean }) {
  return useQuery<ServiceOption[], Error>({
    queryKey: queryKeys.services.options(),
    queryFn: fetchServiceOptions,
    staleTime: 5 * 60 * 1000, // 5 min cache
    gcTime: 15 * 60 * 1000,
    enabled: options?.enabled ?? true,
  });
}
