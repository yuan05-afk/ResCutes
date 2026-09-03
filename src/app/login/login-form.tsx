"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DEMO_ACCOUNTS } from "@/lib/auth/permissions";
import { PawPrint } from "lucide-react";
import { signInAction } from "./actions";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl =
    searchParams.get("callbackUrl") ?? searchParams.get("after") ?? "";
  const [state, formAction, isPending] = useActionState(signInAction, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bone px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-evergreen">
            <PawPrint className="h-8 w-8" />
            <span className="text-2xl font-semibold">ResCutes</span>
          </Link>
          <p className="mt-2 text-sm text-graphite/70">Sign in with Neon Auth</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Use a demo account to explore ResCutes</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-4">
              <input type="hidden" name="callbackUrl" value={callbackUrl} />
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="citizen@rescutes.demo"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="demo1234"
                  required
                />
              </div>
              {state?.error && (
                <p className="text-sm text-rescue" role="alert">
                  {state.error}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6">
              <p className="text-xs font-medium text-graphite/70 mb-3">
                Quick demo access (password: demo1234)
              </p>
              <div className="flex flex-wrap gap-2">
                {DEMO_ACCOUNTS.map((account) => (
                  <form key={account.email} action={formAction}>
                    <input type="hidden" name="callbackUrl" value={callbackUrl} />
                    <input type="hidden" name="email" value={account.email} />
                    <input type="hidden" name="password" value="demo1234" />
                    <button
                      type="submit"
                      disabled={isPending}
                      className="rounded-full border border-sage/40 px-3 py-1 text-xs hover:bg-bone transition-colors disabled:opacity-50"
                    >
                      {account.role.replace("_", " ")}
                    </button>
                  </form>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
