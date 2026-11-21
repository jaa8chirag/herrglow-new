"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUploadMutation } from "@/hooks/api";
import { inputCls } from "./ui";

/**
 * Image upload with REQUIRED alt text.
 * Powered by TanStack Query mutation for caching and state management.
 */
export function UploadField({
  folder = "uploads",
  label = "Upload image",
  onUploaded,
}: {
  folder?: "uploads" | "pros" | "blogs" | "services";
  label?: string;
  onUploaded?: (key: string, alt: string) => Promise<void>;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [alt, setAlt] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

      const uploadMutation = useUploadMutation();

      const submit = async () => {
        const file = fileRef.current?.files?.[0];
        if (!file) return setMsg({ ok: false, text: "Choose an image first." });
        if (alt.trim().length < 5) return setMsg({ ok: false, text: "Alt text is required (describe the image)." });

        try {
          setMsg(null);
          const res = await uploadMutation.mutateAsync({ file, alt: alt.trim(), folder });
          if (res.key && onUploaded) {
            await onUploaded(res.key, alt.trim());
          }
          setMsg({ ok: true, text: "Uploaded successfully." });
          setAlt("");
          if (fileRef.current) fileRef.current.value = "";
          router.refresh();
} catch (err) {
  setMsg({ ok: false, text: err instanceof Error ? err.message : "Upload failed" });
}
  };

return (
  <div className="grid gap-2 rounded-xl border border-dashed border-line bg-ivory-deep/40 p-4">
    <p className="text-sm font-medium text-plum-900">{label}</p>
    <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="text-sm" />
    <input
      value={alt}
      onChange={(e) => setAlt(e.target.value)}
      placeholder="Alt text (required): describe what the image shows"
      className={inputCls}
    />
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={submit}
        disabled={uploadMutation.isPending}
        className="inline-flex min-h-10 items-center rounded-lg bg-plum-700 px-4 text-sm font-medium text-ivory hover:bg-plum-800 disabled:opacity-60"
      >
        {uploadMutation.isPending ? "Uploading…" : "Upload"}
      </button>
      {msg && <span className={msg.ok ? "text-sm text-emerald-700" : "text-sm text-rose-700"}>{msg.text}</span>}
    </div>
  </div>
);
}
