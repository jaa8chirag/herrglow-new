"use client";

import { useMemo, useState } from "react";
import { inputCls } from "./ui";

const words = (h: string) => h.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;

/** HTML textarea with a live word count and a sandboxed preview (no script execution). Saved HTML is sanitised server-side. */
export function RichField({ name, label, defaultValue, target, rows = 14 }: { name: string; label: string; defaultValue: string; target?: number; rows?: number }) {
  const [v, setV] = useState(defaultValue);
  const [preview, setPreview] = useState(false);
  const w = useMemo(() => words(v), [v]);
  const ok = target == null || w >= target;
  return (
    <div className="grid gap-1.5 text-sm font-medium text-plum-900">
      <div className="flex items-center justify-between">
        <label htmlFor={name}>{label}</label>
        <span className="flex items-center gap-3 font-normal">
          <span className={ok ? "text-emerald-700" : "text-amber-700"}>{w} words{target ? ` / ${target} target` : ""}</span>
          <button type="button" onClick={() => setPreview((p) => !p)} className="rounded border border-line px-2 py-0.5 text-xs hover:bg-blush-100">{preview ? "Edit" : "Preview"}</button>
        </span>
      </div>
      {preview ? (
        <iframe title="Preview" sandbox="" srcDoc={`<base target="_blank"><style>body{font:16px/1.7 system-ui;color:#5e4f55;padding:16px}h2,h3{color:#3f1629;font-family:Georgia,serif}</style>${v}`} className="min-h-80 w-full rounded-lg border border-line bg-white" style={{ height: `${rows * 1.6}rem` }} />
      ) : (
        <textarea id={name} name={name} rows={rows} value={v} onChange={(e) => setV(e.target.value)} className={inputCls + " font-mono text-[13px] leading-relaxed"} spellCheck />
      )}
      {preview && <input type="hidden" name={name} value={v} />}
    </div>
  );
}
