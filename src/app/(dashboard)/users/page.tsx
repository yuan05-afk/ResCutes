import { requireRole } from "@/lib/auth/session";
import {
  DEMO_ACCOUNTS,
  ROLE_LABELS,
  ROLES,
  type Role,
} from "@/lib/auth/permissions";
import {
  DashboardHeader,
  PageShell,
} from "@/components/layout/dashboard-header";

export default async function UsersPage() {
  await requireRole([ROLES.ADMINISTRATOR]);

  return (
    <PageShell
      header={
        <DashboardHeader
          title="Users"
          subtitle="Demo roster accounts available in this environment"
        />
      }
    >
      <div className="overflow-hidden rounded-xl border border-sage/25 bg-white shadow-card">
        <div className="border-b border-sage/20 bg-bone/40 px-4 py-2.5 text-xs text-graphite/55">
          {DEMO_ACCOUNTS.length} demo accounts · read-only roster
        </div>
        <ul className="divide-y divide-sage/15">
          {DEMO_ACCOUNTS.map((account) => (
            <li
              key={account.email}
              className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            >
              <div className="min-w-0">
                <p className="font-semibold text-graphite">{account.name}</p>
                <p className="truncate text-sm text-graphite/55">
                  {account.email}
                </p>
                <p className="mt-0.5 text-xs text-graphite/45">
                  {account.description}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-evergreen/10 px-2.5 py-1 text-[11px] font-semibold text-evergreen">
                {ROLE_LABELS[account.role as Role] ?? account.role}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </PageShell>
  );
}
