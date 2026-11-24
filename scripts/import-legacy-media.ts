/**
 * Import the OLD site's photos into the new media library.
 *
 *   1. Copy the old Laravel folder  storage/app/public  to  ./legacy-media/   (gitignored)
 *   2. pnpm import:media                      # DRY RUN: report only
 *      pnpm import:media --apply              # convert → upload (R2, or local disk in dev) → Media rows → link
 *      pnpm import:media --dir D:/old/public --logo logo/site-logo.png --apply
 *
 * For every row with a legacy image path (services.image, blogs.image, galleries.media_path/thumbnail,
 * beauticians.photo + portfolio_images) it finds the file, converts to WebP (max 2000px, quality 82, EXIF-rotated),
 * stores it, creates a Media record (alt text from the row), and points the row at the new media key.
 * Idempotent: rows already linked to a Media key are skipped. Missing files are reported, never faked.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { prisma } from "@herrglow/db";
import { putObject } from "@herrglow/core/src/media/storage";
import { syncPages } from "@herrglow/core";

const args = process.argv.slice(2);
const opt = (n: string) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const APPLY = args.includes("--apply");
const DIR = path.resolve(opt("dir") ?? "legacy-media");
const LOCAL_ROOT = path.resolve("apps/web/public/media");

if (!existsSync(DIR)) {
  console.error(
    `Folder not found: ${DIR}\nCopy the old storage/app/public folder to ./legacy-media/ (or pass --dir).`
  );
  process.exit(1);
}

// case-insensitive index of every file under DIR (Linux paths on the old server are case-sensitive; Windows is not)
const index = new Map<string, string>();
(function walk(d: string) {
  for (const e of readdirSync(d)) {
    const p = path.join(d, e);
    statSync(p).isDirectory()
      ? walk(p)
      : index.set(path.relative(DIR, p).replace(/\\/g, "/").toLowerCase(), p);
  }
})(DIR);
console.log(`${APPLY ? "APPLY" : "DRY RUN"} · source ${DIR} · ${index.size} files found`);

const clean = (p: string) => p.replace(/^\/+/, "").replace(/^(storage|public|app\/public)\//, "");
const resolveFile = (p: string) =>
  index.get(clean(p).toLowerCase()) ?? index.get(p.toLowerCase().replace(/^\/+/, ""));
const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "image";
const isLegacy = (p: string | null | undefined): p is string => !!p && !/^https?:\/\//.test(p);

type Type = "service" | "blog" | "gallery" | "pro" | "logo";
interface Target {
  type: Type;
  label: string;
  path: string;
  alt: string;
  apply: (key: string) => Promise<unknown>;
}

const existing = new Set(
  (await prisma.media.findMany({ select: { key: true } })).map((m) => m.key)
);
const targets: Target[] = [];
const add = (t: Target) => {
  if (isLegacy(t.path) && !existing.has(t.path)) targets.push(t);
};

for (const s of await prisma.service.findMany({
  where: { image: { not: null } },
  select: { id: true, slug: true, title: true, image: true, imageAlt: true },
}))
  add({
    type: "service",
    label: s.slug,
    path: s.image!,
    alt: s.imageAlt || s.title,
    apply: (key) =>
      prisma.service.update({
        where: { id: s.id },
        data: { image: key, imageAlt: s.imageAlt || s.title },
      }),
  });
for (const b of await prisma.blog.findMany({
  where: { image: { not: null } },
  select: { id: true, slug: true, title: true, image: true, imageAlt: true },
}))
  add({
    type: "blog",
    label: b.slug,
    path: b.image!,
    alt: b.imageAlt || b.title,
    apply: (key) =>
      prisma.blog.update({
        where: { id: b.id },
        data: { image: key, imageAlt: b.imageAlt || b.title },
      }),
  });
for (const g of await prisma.galleryItem.findMany({
  where: { mediaType: "IMAGE" },
  select: { id: true, title: true, mediaPath: true, thumbnail: true, alt: true },
})) {
  const alt = g.alt || g.title;
  if (g.mediaPath)
    add({
      type: "gallery",
      label: g.title,
      path: g.mediaPath,
      alt,
      apply: (key) =>
        prisma.galleryItem.update({ where: { id: g.id }, data: { mediaPath: key, alt } }),
    });
  if (g.thumbnail)
    add({
      type: "gallery",
      label: `${g.title} (thumb)`,
      path: g.thumbnail,
      alt,
      apply: (key) => prisma.galleryItem.update({ where: { id: g.id }, data: { thumbnail: key } }),
    });
}
for (const p of await prisma.pro.findMany({
  select: { id: true, name: true, photo: true, portfolio: true },
})) {
  if (p.photo)
    add({
      type: "pro",
      label: p.name,
      path: p.photo,
      alt: `${p.name}, profile photo`,
      apply: (key) => prisma.pro.update({ where: { id: p.id }, data: { photo: key } }),
    });
  const items = (Array.isArray(p.portfolio) ? p.portfolio : []) as { path: string; alt?: string }[];
  for (const it of items) {
    if (!isLegacy(it.path) || existing.has(it.path)) continue;
    add({
      type: "pro",
      label: `${p.name} (portfolio)`,
      path: it.path,
      alt: it.alt || `${p.name}, portfolio work`,
      apply: async (key) => {
        const cur = (
          await prisma.pro.findUniqueOrThrow({ where: { id: p.id }, select: { portfolio: true } })
        ).portfolio as { path: string; alt?: string }[] | null;
        return prisma.pro.update({
          where: { id: p.id },
          data: {
            portfolio: (cur ?? []).map((x) =>
              x.path === it.path
                ? { ...x, path: key, alt: x.alt || it.alt || `${p.name}, portfolio work` }
                : x
            ),
          },
        });
      },
    });
  }
}
const logo = opt("logo");
if (logo)
  add({
    type: "logo",
    label: "site logo",
    path: logo,
    alt: "HerrGlow logo",
    apply: (key) =>
      prisma.siteSetting.upsert({
        where: { key: "site_logo" },
        update: { value: key },
        create: { key: "site_logo", value: key },
      }),
  });

const report: Record<
  Type,
  { total: number; found: number; missing: number; unsupported: number; missingPaths: string[] }
> = {
  service: { total: 0, found: 0, missing: 0, unsupported: 0, missingPaths: [] },
  blog: { total: 0, found: 0, missing: 0, unsupported: 0, missingPaths: [] },
  gallery: { total: 0, found: 0, missing: 0, unsupported: 0, missingPaths: [] },
  pro: { total: 0, found: 0, missing: 0, unsupported: 0, missingPaths: [] },
  logo: { total: 0, found: 0, missing: 0, unsupported: 0, missingPaths: [] },
};

const uploaded = new Map<string, string>(); // source path → new key (one upload per file, even if several rows use it)
let bytesIn = 0,
  bytesOut = 0;

for (const t of targets) {
  const r = report[t.type];
  r.total++;
  const file = resolveFile(t.path);
  if (!file) {
    r.missing++;
    r.missingPaths.push(t.path);
    continue;
  }
  if (/\.(svg|gif)$/i.test(file)) {
    r.unsupported++;
    continue;
  }
  r.found++;
  if (!APPLY) continue;

  let key = uploaded.get(t.path);
  if (!key) {
    const input = readFileSync(file);
    const out = await sharp(input)
      .rotate()
      .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    key = `legacy/${t.type}/${createHash("sha1").update(t.path).digest("hex").slice(0, 10)}-${slug(t.label)}.webp`;
    await putObject(key, out, "image/webp", LOCAL_ROOT);
    await prisma.media.upsert({
      where: { key },
      update: { alt: t.alt },
      create: {
        key,
        alt: t.alt,
        mime: "image/webp",
        size: out.length,
        uploadedBy: "legacy-import",
      },
    });
    uploaded.set(t.path, key);
    bytesIn += input.length;
    bytesOut += out.length;
  }
  await t.apply(key);
}

console.log("\ntype      to-import  found  missing  unsupported");
for (const [type, r] of Object.entries(report))
  console.log(
    `${type.padEnd(9)} ${String(r.total).padStart(9)}  ${String(r.found).padStart(5)}  ${String(r.missing).padStart(7)}  ${String(r.unsupported).padStart(11)}`
  );
if (APPLY)
  console.log(
    `\nuploaded ${uploaded.size} files · ${(bytesIn / 1e6).toFixed(1)} MB → ${(bytesOut / 1e6).toFixed(1)} MB WebP`
  );
for (const [type, r] of Object.entries(report))
  if (r.missingPaths.length)
    console.log(`\nmissing ${type} (first 8): ${r.missingPaths.slice(0, 8).join(", ")}`);

mkdirSync("infra/import/out", { recursive: true });
writeFileSync("infra/import/out/media-report.json", JSON.stringify(report, null, 2));

if (APPLY) {
  console.log(
    `\nre-syncing pages (artist pages become indexable once a real photo + 50-word bio exist; needs MEDIA_BASE set: ${process.env.MEDIA_BASE ?? process.env.NEXT_PUBLIC_MEDIA_BASE ?? "NOT SET"})`
  );
  console.log(await syncPages());
} else console.log("\nDRY RUN: nothing written. Re-run with --apply.");
await prisma.$disconnect();
