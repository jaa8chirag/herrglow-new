import { listAdmins } from "@herrglow/core";
import { PageHeader, Panel, Table, Td } from "@/components/admin/layout";
import { CreateUserForm, ResetPasswordForm } from "@/components/admin/UserForms";
import { Pill, inputCls } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { setActiveAction, setRoleAction } from "./actions";

export default async function UsersPage() {
  const me = await requireAdmin("users");
  const users = await listAdmins();
  return (
    <>
      <PageHeader
        title="Admin users"
        subtitle="Owner only. There is always at least one active owner. Changes apply immediately, even to signed-in sessions."
      />
      <Panel title="Add a user" className="mb-6">
        <CreateUserForm />
      </Panel>
      <Table head={["User", "Role", "Status", "Last sign-in", "Actions"]}>
        {users.map((u) => {
          const self = u.id === me.id;
          return (
            <tr key={u.id}>
              <Td className="font-medium">
                {u.email}
                {self && <span className="ml-2 text-xs font-normal text-ink-soft">(you)</span>}
                {u.name && (
                  <>
                    <br />
                    <span className="text-xs font-normal text-ink-soft">{u.name}</span>
                  </>
                )}
              </Td>
              <Td>
                {self ? (
                  <Pill tone="info">{u.role.toLowerCase()}</Pill>
                ) : (
                  <form action={setRoleAction} className="flex items-center gap-1">
                    <input type="hidden" name="id" value={u.id} />
                    <select
                      name="role"
                      defaultValue={u.role}
                      className={inputCls + " !min-h-8 !py-1 text-xs"}
                    >
                      <option value="OWNER">Owner</option>
                      <option value="MANAGER">Manager</option>
                      <option value="CONTENT">Content</option>
                    </select>
                    <button className="rounded-lg border border-line bg-white px-2 text-xs hover:bg-blush-100">
                      Set
                    </button>
                  </form>
                )}
              </Td>
              <Td>
                <Pill tone={u.active ? "good" : "neutral"}>
                  {u.active ? "active" : "deactivated"}
                </Pill>
                {u.mustChangePassword && (
                  <>
                    {" "}
                    <Pill tone="warn">must change password</Pill>
                  </>
                )}
              </Td>
              <Td className="whitespace-nowrap text-ink-soft">
                {u.lastLoginAt ? u.lastLoginAt.toLocaleString("en-IN") : "never"}
              </Td>
              <Td>
                <div className="flex flex-wrap items-start gap-2">
                  {!self && (
                    <form action={setActiveAction}>
                      <input type="hidden" name="id" value={u.id} />
                      <input type="hidden" name="active" value={u.active ? "0" : "1"} />
                      <button
                        className={`rounded-lg border px-2.5 py-1 text-xs ${u.active ? "border-line bg-white text-rose-700 hover:bg-rose-50" : "border-plum-700 bg-plum-700 text-ivory"}`}
                      >
                        {u.active ? "Deactivate" : "Activate"}
                      </button>
                    </form>
                  )}
                  <ResetPasswordForm id={u.id} email={u.email} />
                </div>
              </Td>
            </tr>
          );
        })}
      </Table>
    </>
  );
}
