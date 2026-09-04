"use client";

import { useActionState, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DEMO_ACCOUNTS,
  ROLE_LABELS,
  ROLES,
  type Role,
} from "@/lib/auth/permissions";
import { TERMS_OF_USE } from "@/lib/legal/terms";
import { TermsSheet } from "@/components/legal/terms-sheet";
import { ArrowLeft, PawPrint } from "lucide-react";
import { signInAction } from "./actions";

const MOBILE_DEMO = DEMO_ACCOUNTS.filter(
  (account) =>
    account.role === ROLES.CITIZEN || account.role === ROLES.RESCUER,
);

const WEB_DEMO = DEMO_ACCOUNTS.filter(
  (account) =>
    account.role === ROLES.SHELTER_STAFF ||
    account.role === ROLES.VETERINARIAN ||
    account.role === ROLES.ADMINISTRATOR,
);

function DemoRoleButton({
  account,
  callbackUrl,
  formAction,
  pending,
}: {
  account: (typeof DEMO_ACCOUNTS)[number];
  callbackUrl: string;
  formAction: (payload: FormData) => void;
  pending: boolean;
}) {
  const label =
    ROLE_LABELS[account.role as Role] ?? account.role.replace("_", " ");

  return (
    <form action={formAction}>
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <input type="hidden" name="email" value={account.email} />
      <input type="hidden" name="password" value="demo1234" />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md border border-sage/40 bg-white px-2.5 py-2 text-left transition hover:border-evergreen/45 hover:bg-bone disabled:opacity-50"
      >
        <span className="block text-[0.8rem] font-semibold leading-tight text-evergreen">
          {label}
        </span>
        <span className="mt-0.5 block text-[0.65rem] leading-snug text-graphite/60">
          {account.description}
        </span>
      </button>
    </form>
  );
}

/** Full-bleed backdrop: empty center for the card, empathetic dog on the right. */
function LoginBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <Image
        src="/login/backdrop-empathy.jpg"
        alt=""
        fill
        quality={92}
        priority
        sizes="100vw"
        className="object-cover object-[center_45%] lg:object-[center_40%]"
      />
      {/* Dark filter so the white sign-in card stands out */}
      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/20 to-black/50" />
      {/* Soft side vignette keeps focus on the card without a bright glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,transparent_42%,rgba(0,0,0,0.35)_100%)]" />
    </div>
  );
}

export default function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl =
    searchParams.get("callbackUrl") ?? searchParams.get("after") ?? "";
  const [state, formAction, isPending] = useActionState(signInAction, null);
  const [termsOpen, setTermsOpen] = useState(false);

  return (
    <div className="relative min-h-[100svh] overflow-hidden">
      <LoginBackdrop />

      <div className="relative z-10 flex min-h-[100svh] flex-col px-4 py-4 sm:px-6 sm:py-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to home
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-white"
            aria-label="ResCutes home"
          >
            <PawPrint className="h-5 w-5" />
            <span className="text-sm font-semibold tracking-tight">
              ResCutes
            </span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-[26rem] rounded-xl border border-white/25 bg-white p-4 shadow-[0_24px_64px_rgba(0,0,0,0.45)] sm:p-5">
            <div className="mb-3">
              <h1 className="text-lg font-semibold text-evergreen">Sign In</h1>
              <p className="mt-1 text-xs leading-snug text-graphite/65">
                Mobile roles open the field app. Web roles open the dashboard.
              </p>
            </div>

            <form action={formAction} className="space-y-2.5">
              <input type="hidden" name="callbackUrl" value={callbackUrl} />
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="citizen@rescutes.demo"
                  className="h-9"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password" className="text-xs">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="demo1234"
                  className="h-9"
                  required
                />
              </div>
              {state?.error && (
                <p className="text-xs text-rescue" role="alert">
                  {state.error}
                </p>
              )}
              <Button type="submit" className="h-9 w-full" disabled={isPending}>
                {isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-4 border-t border-sage/20 pt-3">
              <p className="mb-2.5 text-[0.7rem] text-graphite/65">
                Demo password{" "}
                <code className="rounded bg-bone px-1 py-0.5 font-semibold text-evergreen">
                  demo1234
                </code>
              </p>

              <div className="space-y-3">
                <div>
                  <p className="mb-1.5 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-evergreen">
                    Mobile app
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {MOBILE_DEMO.map((account) => (
                      <DemoRoleButton
                        key={account.email}
                        account={account}
                        callbackUrl={callbackUrl}
                        formAction={formAction}
                        pending={isPending}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-evergreen">
                    Web dashboard
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {WEB_DEMO.map((account) => (
                      <DemoRoleButton
                        key={account.email}
                        account={account}
                        callbackUrl={callbackUrl}
                        formAction={formAction}
                        pending={isPending}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-3 text-center text-[0.7rem] leading-snug text-graphite/60">
              {TERMS_OF_USE.loginNote}
              <button
                type="button"
                onClick={() => setTermsOpen(true)}
                className="font-semibold text-evergreen underline-offset-2 hover:underline"
              >
                {TERMS_OF_USE.footerLink}
              </button>
              .
            </p>
          </div>
        </div>
      </div>

      <TermsSheet open={termsOpen} onDismiss={() => setTermsOpen(false)} />
    </div>
  );
}
