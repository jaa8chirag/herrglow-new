import Link from "next/link";
import { notFound } from "next/navigation";
import { getApplication } from "@herrglow/core";
import { PageHeader, Panel } from "@/components/admin/layout";
import { Field, Pill, SubmitButton, inputCls } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { mediaUrl } from "@/lib/media";
import { approveAction, rejectAction } from "../actions";

export default async function ApplicationDetail(props: PageProps<"/admin/applications/[id]">) {
  await requireAdmin("pros");
  const { id } = await props.params;
  const sp = await props.searchParams;
  const a = await getApplication(id);
  if (!a) notFound();
  const photo = mediaUrl(a.photoKey);
  const idProof = mediaUrl(a.idProofKey);
  const isPdf = a.idProofKey?.endsWith(".pdf");
  const err = Array.isArray(sp.err) ? sp.err[0] : sp.err;
  return (
    <>
      <PageHeader title={a.name} subtitle={<><Link className="underline" href="/admin/applications">← Applications</Link> · <Pill tone={a.status === "NEW" ? "warn" : a.status === "APPROVED" ? "good" : "neutral"}>{a.status.toLowerCase()}</Pill></>} />
      {err && <p className="mb-4 rounded-lg bg-rose-100 p-3 text-sm text-rose-700">{err}</p>}
      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <Panel title="Application">
          <dl className="grid grid-cols-[130px_1fr] gap-y-2 text-sm">
            <dt className="text-ink-soft">Phone</dt><dd>{a.phone}</dd>
            <dt className="text-ink-soft">Email</dt><dd>{a.email ?? "—"}</dd>
            <dt className="text-ink-soft">Area &amp; Coverage</dt><dd className="font-medium text-plum-950">{a.city}</dd>
            {a.latitude != null && a.longitude != null && (
              <>
                <dt className="text-ink-soft">Live GPS Pin</dt>
                <dd>
                  <span className="font-mono text-xs">{Number(a.latitude).toFixed(4)}°, {Number(a.longitude).toFixed(4)}°</span>
                  <a
                    href={`https://www.google.com/maps?q=${a.latitude},${a.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2.5 inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100 transition"
                  >
                    📍 View on Google Maps ↗
                  </a>
                </dd>
              </>
            )}
            <dt className="text-ink-soft">Travel Radius</dt>
            <dd className="font-medium text-plum-900">
              {a.travelRadius ? (a.travelRadius >= 40 ? "Anywhere in Delhi NCR (Bridal / VIP)" : `Up to ${a.travelRadius} km`) : "Standard (10 km)"}
            </dd>
            <dt className="text-ink-soft">Offers</dt><dd>{a.categories.join(", ") || "—"}</dd>
            <dt className="text-ink-soft">Specialities</dt><dd>{a.servicesText ?? "—"}</dd>
            <dt className="text-ink-soft">Experience</dt><dd>{a.experienceYears != null ? `${a.experienceYears} years` : "—"}</dd>
            <dt className="text-ink-soft">Portfolio</dt><dd>{a.portfolioUrl ? <a className="text-rose-700 underline" href={a.portfolioUrl} target="_blank" rel="noopener noreferrer">{a.portfolioUrl}</a> : "—"}</dd>
            <dt className="text-ink-soft">Message</dt><dd className="whitespace-pre-wrap">{a.message ?? "—"}</dd>
            <dt className="text-ink-soft">Received</dt><dd>{a.createdAt.toLocaleString("en-IN")}</dd>
            {a.proId && (<><dt className="text-ink-soft">Artist profile</dt><dd><Link className="text-rose-700 underline" href={`/admin/pros/${a.proId}`}>Open artist</Link></dd></>)}
            {a.rejectReason && (<><dt className="text-ink-soft">Reject reason</dt><dd>{a.rejectReason}</dd></>)}
          </dl>
          {a.photoKey && <div className="mt-5">{photo ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={photo} alt={`${a.name}`} className="size-40 rounded-xl object-cover" /> : <p className="text-sm text-ink-soft">Photo stored ({a.photoKey}) but media delivery is not configured here.</p>}</div>}
          {a.idProofKey && (
            <div className="mt-5 border-t border-line/60 pt-4">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-plum-900">Government ID Proof (Verification)</h4>
              {isPdf ? (
                <a href={idProof ?? "#"} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-blush-100 px-4 py-2.5 text-xs font-semibold text-plum-950 transition hover:bg-blush-200">
                  📄 View / Download ID Proof Document (PDF)
                </a>
              ) : idProof ? (
                <a href={idProof} target="_blank" rel="noopener noreferrer" className="block max-w-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={idProof} alt={`${a.name} ID proof`} className="max-h-52 w-auto rounded-xl border border-line object-contain shadow-sm transition hover:opacity-90" />
                  <span className="mt-1 block text-xs font-medium text-rose-700 underline">Click to view full resolution</span>
                </a>
              ) : (
                <p className="text-xs text-ink-soft">ID proof stored ({a.idProofKey}).</p>
              )}
            </div>
          )}
        </Panel>
        {a.status === "NEW" && (
          <div className="grid content-start gap-4">
            <Panel title="Approve">
              <p className="mb-3 text-sm text-ink-soft">Creates an <strong>inactive</strong> artist with these details. Contact data stays private. You then complete the profile (bio, services, coverage areas) and set it Active.</p>
              <form action={approveAction}><input type="hidden" name="id" value={a.id} /><SubmitButton>Approve &amp; create artist</SubmitButton></form>
            </Panel>
            <Panel title="Reject">
              <form action={rejectAction} className="grid gap-3"><input type="hidden" name="id" value={a.id} /><Field label="Reason (internal)"><input name="reason" className={inputCls} /></Field><SubmitButton variant="ghost">Reject</SubmitButton></form>
            </Panel>
          </div>
        )}
      </div>
    </>
  );
}
