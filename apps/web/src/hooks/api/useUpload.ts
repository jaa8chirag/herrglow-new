"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./keys";

export interface UploadPayload {
  file: File;
  alt: string;
  folder?: "uploads" | "pros" | "blogs" | "services";
}

export interface UploadResponse {
  ok: boolean;
  key?: string;
  error?: string;
}

async function uploadFileApi(payload: UploadPayload): Promise<UploadResponse> {
  const fd = new FormData();
  fd.set("file", payload.file);
  fd.set("alt", payload.alt);
  if (payload.folder) fd.set("folder", payload.folder);

  const res = await fetch("/api/admin/upload", {
    method: "POST",
    body: fd,
  });

  const json = (await res.json()) as UploadResponse;
  if (!res.ok || !json.ok || !json.key) {
    throw new Error(json.error ?? "Failed to upload image");
  }
  return json;
}

/**
 * Mutation hook for secure media uploads with automatic cache management.
 */
export function useUploadMutation() {
  const queryClient = useQueryClient();

  return useMutation<UploadResponse, Error, UploadPayload>({
    mutationFn: uploadFileApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.uploads() });
    },
  });
}
