import { requireAuth } from "@/lib/auth/session";
import { ROLE_LABELS } from "@/lib/auth/permissions";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/auth/sign-out-button";
import Link from "next/link";

export default async function MobileProfilePage() {
  const session = await requireAuth();

  return (
    <div>
      <header className="border-b border-sage/20 bg-white px-4 py-5">
        <h1 className="text-xl font-bold text-graphite">Profile</h1>
      </header>

      <div className="px-4 py-6 space-y-4">
        <div className="rounded-2xl border border-sage/25 bg-white p-5 shadow-card">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-evergreen/10 text-xl font-bold text-evergreen">
            {session.user.name.charAt(0)}
          </div>
          <h2 className="mt-4 text-lg font-bold text-graphite">{session.user.name}</h2>
          <p className="text-sm text-graphite/55">{session.user.email}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {session.user.roles.map((role) => (
              <span
                key={role}
                className="rounded-full bg-evergreen/10 px-3 py-1 text-xs font-semibold text-evergreen"
              >
                {ROLE_LABELS[role]}
              </span>
            ))}
          </div>
        </div>

        {session.user.roles.some((r) =>
          ["shelter_staff", "veterinarian", "administrator"].includes(r),
        ) && (
          <Button variant="outline" asChild className="w-full rounded-full h-12">
            <Link href="/dashboard">Open dashboard</Link>
          </Button>
        )}

        <SignOutButton />
      </div>
    </div>
  );
}
