import { requireAuth } from "@/lib/auth/session";
import { getProfileRoleLabels, isAdministrator } from "@/lib/auth/permissions";
import { getUserProfilePrefs } from "@/lib/data/user-profile";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { MobileProfileEditor } from "@/components/mobile/mobile-profile-editor";
import { Monitor } from "lucide-react";
import Link from "next/link";

export default async function MobileProfilePage() {
  const session = await requireAuth();
  const isAdmin = isAdministrator(session.user.roles);
  const roleLabels = getProfileRoleLabels(session.user.roles);
  const prefs = await getUserProfilePrefs(session.user.id);

  return (
    <div>
      <header className="border-b border-sage/20 bg-white px-4 py-5">
        <h1 className="text-xl font-bold text-graphite">Profile</h1>
      </header>

      <div className="space-y-4 px-4 py-6">
        <div className="rounded-2xl border border-sage/25 bg-white p-5 shadow-card">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-evergreen/10 text-xl font-bold text-evergreen">
            {session.user.name.charAt(0)}
          </div>
          <h2 className="mt-4 text-lg font-bold text-graphite">{session.user.name}</h2>
          <p className="text-sm text-graphite/55">{session.user.email}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {roleLabels.map((label) => (
              <span
                key={label}
                className="rounded-full bg-evergreen/10 px-3 py-1 text-xs font-semibold text-evergreen"
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <MobileProfileEditor initialPhone={prefs.phone} />

        {isAdmin ? (
          <Button variant="outline" asChild className="h-12 w-full rounded-full">
            <Link href="/dashboard" target="_blank" rel="noopener noreferrer">
              <Monitor className="mr-2 h-4 w-4" aria-hidden />
              Open dashboard
            </Link>
          </Button>
        ) : null}

        <SignOutButton />
      </div>
    </div>
  );
}
