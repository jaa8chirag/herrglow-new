import { SETTING_GROUPS, getSettingsAdmin } from "@herrglow/core";
import { PageHeader, Panel } from "@/components/admin/layout";
import { Field, SubmitButton, inputCls } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { saveSettingsAction } from "./actions";

export default async function SettingsPage(props: PageProps<"/admin/settings">) {
  await requireAdmin("settings");
  const sp = await props.searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const s = await getSettingsAdmin();
  return (
    <>
      <PageHeader title="Salon & WhatsApp Settings" subtitle="Configure your salon's primary WhatsApp number, phone contacts, business hours, and operational notifications." />
      {one(sp.ok) && <p className="mb-4 rounded-lg bg-emerald-100 p-3 text-sm text-emerald-800">{one(sp.ok)}</p>}
      {one(sp.err) && <p className="mb-4 rounded-lg bg-rose-100 p-3 text-sm text-rose-700">{one(sp.err)}</p>}
      <form action={saveSettingsAction} className="grid max-w-3xl gap-6">
        {SETTING_GROUPS.map((g) => (
          <Panel key={g.title} title={g.title}>
            <div className="grid gap-4">
              {g.fields.map((f) =>
                f.type === "bool" ? (
                  <label key={f.key} className="flex items-center gap-2 text-sm font-medium text-plum-900"><input type="checkbox" name={f.key} defaultChecked={s[f.key] === "1"} className="accent-[var(--color-plum-700)]" />{f.label}{f.hint && <span className="font-normal text-ink-soft">({f.hint})</span>}</label>
                ) : (
                  <Field key={f.key} label={f.label} hint={f.hint}>
                    {f.type === "textarea" ? <textarea name={f.key} rows={2} defaultValue={s[f.key] ?? ""} className={inputCls} /> : <input name={f.key} defaultValue={s[f.key] ?? ""} inputMode={f.type === "phone" ? "tel" : undefined} className={inputCls} />}
                  </Field>
                ),
              )}
            </div>
          </Panel>
        ))}
        <div><SubmitButton>Save settings</SubmitButton></div>
      </form>
    </>
  );
}
