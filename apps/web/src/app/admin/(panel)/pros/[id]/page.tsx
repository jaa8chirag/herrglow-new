import Link from "next/link";
import { notFound } from "next/navigation";
import { areasOfCity, getProAdmin } from "@herrglow/core";
import { PageHeader, Panel, Tabs } from "@/components/admin/layout";
import { RichField } from "@/components/admin/RichField";
import { UploadField } from "@/components/admin/UploadField";
import { Field, Pill, SubmitButton, inputCls } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { mediaUrl } from "@/lib/media";
import {
  attachPhoto,
  attachPortfolio,
  removePhotoAction,
  removePortfolioAction,
  saveCoverageAction,
  savePrivateAction,
  saveProfileAction,
  saveServicesAction,
} from "../actions";

export default async function ProEdit(props: PageProps<"/admin/pros/[id]">) {
  await requireAdmin("pros");
  const { id } = await props.params;
  const sp = await props.searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const data = await getProAdmin(id);
  if (!data) notFound();
  const { pro, categories, cities, noindexReason, mediaKeys } = data;
  const citySlug = one(sp.city) ?? cities.find((c) => c.isActive)?.slug ?? cities[0]?.slug;
  const areas = citySlug ? await areasOfCity(citySlug) : [];
  const covered = new Set(pro.coverage.map((c) => c.areaId));
  const mine = new Set(pro.services.map((s) => s.serviceId));
  const portfolio = (Array.isArray(pro.portfolio) ? pro.portfolio : []) as {
    path: string;
    alt: string;
  }[];
  const photoUrl = pro.photo && mediaKeys.has(pro.photo) ? mediaUrl(pro.photo) : null;
  const ok = one(sp.ok);
  const coverageByCity = new Map<string, number>();
  for (const c of pro.coverage)
    coverageByCity.set(c.area.citySlug, (coverageByCity.get(c.area.citySlug) ?? 0) + 1);

  return (
    <>
      <PageHeader
        title={pro.name}
        subtitle={
          <>
            <Link className="underline" href="/admin/pros">
              ← Artists
            </Link>{" "}
            ·{" "}
            <Pill tone={pro.status === "ACTIVE" ? "good" : "neutral"}>
              {pro.status.toLowerCase()}
            </Pill>{" "}
            {pro.coverage.length === 0 && pro.status === "ACTIVE" && (
              <Pill tone="bad">needs coverage</Pill>
            )}
          </>
        }
      />
      {ok && <p className="mb-4 rounded-lg bg-emerald-100 p-3 text-sm text-emerald-800">{ok}</p>}
      <p className="mb-4 text-sm">
        {noindexReason ? (
          <span className="text-amber-700">Public page is noindex: {noindexReason}.</span>
        ) : (
          <span className="text-emerald-700">Public page is indexable.</span>
        )}
      </p>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Profile">
          <form action={saveProfileAction} className="grid gap-4">
            <input type="hidden" name="id" value={pro.id} />
            <Field label="Name">
              <input name="name" defaultValue={pro.name} required className={inputCls} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Type">
                <select name="providerType" defaultValue={pro.providerType} className={inputCls}>
                  <option value="BEAUTICIAN">Beautician</option>
                  <option value="MAKEOVER_ARTIST">Makeover artist</option>
                  <option value="BOTH">Both</option>
                </select>
              </Field>
              <Field label="Status">
                <select name="status" defaultValue={pro.status} className={inputCls}>
                  <option value="ACTIVE">Active</option>
                  <option value="PENDING">Pending</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </Field>
            </div>
            <Field label="Specialisation">
              <input
                name="specialization"
                defaultValue={pro.specialization ?? ""}
                className={inputCls}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Experience (years)">
                <input
                  name="experienceYears"
                  inputMode="numeric"
                  defaultValue={pro.experienceYears ?? ""}
                  className={inputCls}
                />
              </Field>
              <Field label="Base price (₹)">
                <input
                  name="basePrice"
                  inputMode="decimal"
                  defaultValue={pro.basePrice ? String(Number(pro.basePrice)) : ""}
                  className={inputCls}
                />
              </Field>
            </div>
            <RichField
              name="bio"
              label="Bio (HTML)"
              defaultValue={pro.bio ?? ""}
              target={50}
              rows={8}
            />
            <Field label="SEO title">
              <input name="seoTitle" defaultValue={pro.seoTitle ?? ""} className={inputCls} />
            </Field>
            <Field label="SEO description">
              <textarea
                name="seoDescription"
                rows={2}
                defaultValue={pro.seoDescription ?? ""}
                className={inputCls}
              />
            </Field>
            <SubmitButton>Save profile</SubmitButton>
          </form>
        </Panel>

        <div className="grid content-start gap-6">
          <Panel title="Photo">
            <div className="mb-4 flex items-center gap-4">
              {photoUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */ <img
                  src={photoUrl}
                  alt={pro.name}
                  className="size-24 rounded-full object-cover"
                />
              ) : (
                <span className="grid size-24 place-items-center rounded-full bg-blush-100 text-3xl text-plum-800">
                  {pro.name[0]}
                </span>
              )}
              <div className="text-sm text-ink-soft">
                {photoUrl
                  ? "A real photo is set."
                  : pro.photo
                    ? "A legacy path is stored but the file was never uploaded, so it counts as a placeholder."
                    : "No photo yet."}
                {pro.photo && (
                  <form action={removePhotoAction} className="mt-2">
                    <input type="hidden" name="id" value={pro.id} />
                    <button className="text-xs underline">Remove photo</button>
                  </form>
                )}
              </div>
            </div>
            <UploadField
              folder="pros"
              label="Upload photo"
              onUploaded={attachPhoto.bind(null, pro.id)}
            />
          </Panel>

          <Panel title="Portfolio">
            <div className="mb-4 grid grid-cols-4 gap-2">
              {portfolio
                .filter((p) => mediaKeys.has(p.path))
                .map((p) => (
                  <form key={p.path} action={removePortfolioAction} className="relative">
                    <input type="hidden" name="id" value={pro.id} />
                    <input type="hidden" name="path" value={p.path} />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={mediaUrl(p.path)!}
                      alt={p.alt}
                      className="aspect-square w-full rounded-lg object-cover"
                    />
                    <button
                      className="absolute right-1 top-1 rounded bg-white/90 px-1.5 text-xs text-rose-700"
                      aria-label="Remove"
                    >
                      ✕
                    </button>
                  </form>
                ))}
              {portfolio.length > 0 && !portfolio.some((p) => mediaKeys.has(p.path)) && (
                <p className="col-span-4 text-sm text-ink-soft">
                  {portfolio.length} legacy portfolio paths stored; files not uploaded yet.
                </p>
              )}
            </div>
            <UploadField
              folder="pros"
              label="Add portfolio image"
              onUploaded={attachPortfolio.bind(null, pro.id)}
            />
          </Panel>

          <Panel title="Private details (admin only, never public)">
            <form action={savePrivateAction} className="grid gap-3">
              <input type="hidden" name="id" value={pro.id} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Phone">
                  <input
                    name="phone"
                    defaultValue={pro.private?.phone ?? ""}
                    className={inputCls}
                  />
                </Field>
                <Field label="Email">
                  <input
                    name="email"
                    defaultValue={pro.private?.email ?? ""}
                    className={inputCls}
                  />
                </Field>
              </div>
              <Field label="Address">
                <input
                  name="addressLine"
                  defaultValue={pro.private?.addressLine ?? ""}
                  className={inputCls}
                />
              </Field>
              <Field label="Pincode">
                <input
                  name="pincode"
                  defaultValue={pro.private?.pincode ?? ""}
                  className={inputCls}
                />
              </Field>
              <SubmitButton variant="ghost">Save private details</SubmitButton>
            </form>
          </Panel>
        </div>
      </div>

      <Panel title="Services offered" className="mt-6">
        <form action={saveServicesAction} className="grid gap-5">
          <input type="hidden" name="id" value={pro.id} />
          {categories.map((c) => (
            <fieldset key={c.id}>
              <legend className="mb-2 text-sm font-semibold text-plum-900">{c.name}</legend>
              <div className="grid gap-1 sm:grid-cols-2 xl:grid-cols-3">
                {c.services.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="serviceId"
                      value={s.id}
                      defaultChecked={mine.has(s.id)}
                      className="accent-[var(--color-plum-700)]"
                    />
                    {s.title}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          <SubmitButton>Save services</SubmitButton>
        </form>
      </Panel>

      <Panel title="Coverage areas" className="mt-6">
        <Tabs
          items={cities.map((c) => ({
            href: `?city=${c.slug}`,
            active: c.slug === citySlug,
            label: (
              <>
                {c.name}
                {!c.isActive && <span className="opacity-60"> (inactive)</span>} ·{" "}
                {coverageByCity.get(c.slug) ?? 0}
              </>
            ),
          }))}
        />
        {areas.length === 0 ? (
          <p className="text-sm text-ink-soft">Choose a city.</p>
        ) : (
          <form action={saveCoverageAction} className="grid gap-4">
            <input type="hidden" name="id" value={pro.id} />
            <input type="hidden" name="city" value={citySlug} />
            <div className="grid max-h-96 gap-1 overflow-y-auto rounded-xl border border-line p-3 sm:grid-cols-2 xl:grid-cols-3">
              {areas.map((a) => (
                <label key={a.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="areaId"
                    value={a.id}
                    defaultChecked={covered.has(a.id)}
                    className="accent-[var(--color-plum-700)]"
                  />
                  {a.name}
                  {a.zone && <span className="text-xs text-ink-soft">({a.zone})</span>}
                </label>
              ))}
            </div>
            <SubmitButton>Save coverage for this city</SubmitButton>
          </form>
        )}
      </Panel>
    </>
  );
}
