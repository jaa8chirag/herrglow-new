import { listMedia, r2Configured } from "@herrglow/core";
import { PageHeader, Panel } from "@/components/admin/layout";
import { UploadField } from "@/components/admin/UploadField";
import { requireAdmin } from "@/lib/admin";
import { mediaUrl } from "@/lib/media";
import { deleteMediaAction } from "./actions";

export default async function MediaPage(props: PageProps<"/admin/media">) {
  await requireAdmin("media");
  const sp = await props.searchParams;
  const err = Array.isArray(sp.err) ? sp.err[0] : sp.err;
  const items = await listMedia(120);
  return (
    <>
      <PageHeader title="Media library" subtitle={r2Configured() ? "Storage: Cloudflare R2" : "Storage: local disk (development). Set R2_* variables to use Cloudflare R2."} />
      {err && <p className="mb-4 rounded-lg bg-rose-100 p-3 text-sm text-rose-700">{err}</p>}
      <Panel className="mb-6"><UploadField folder="uploads" label="Upload image (JPEG, PNG, WebP or AVIF, up to 8 MB). Alt text is required." /></Panel>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6">
        {items.length === 0 && <p className="col-span-full text-sm text-ink-soft">No images yet.</p>}
        {items.map((m) => {
          const url = mediaUrl(m.key);
          return (
            <figure key={m.id} className="rounded-xl border border-line bg-white p-2 text-xs shadow-soft">
              {url ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={url} alt={m.alt} loading="lazy" className="aspect-square w-full rounded-lg bg-ivory-deep object-cover" /> : <div className="grid aspect-square place-items-center rounded-lg bg-ivory-deep text-ink-soft">no preview</div>}
              <figcaption className="mt-2 space-y-1">
                <p className="line-clamp-2 text-ink-soft">{m.alt}</p>
                <p className="break-all font-mono text-[10px] text-ink-soft">{m.key}</p>
                <form action={deleteMediaAction}><input type="hidden" name="id" value={m.id} /><button className="text-rose-700 underline">Delete</button></form>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </>
  );
}
