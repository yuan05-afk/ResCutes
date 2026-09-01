"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DEMO_ACCOUNTS, ROLES, canAccessDashboard } from "@/lib/auth/permissions";
import type { Role } from "@/lib/auth/permissions";
import { PawPrint } from "lucide-react";

function normalizeCallbackPath(raw: string | null): string | null {
  if (!raw) return null;
  try {
    if (raw.startsWith("http")) {
      return new URL(raw).pathname;
    }
    return raw.startsWith("/") ? raw : `/${raw}`;
  } catch {
    return null;
  }
}

function defaultPathForRoles(roles: Role[]): string {
  if (canAccessDashboard(roles)) return "/dashboard";
  if (roles.includes(ROLES.RESCUER) || roles.includes(ROLES.CITIZEN)) return "/mobile";
  return "/";
}

function rolesForEmail(email: string): Role[] {
  const account = DEMO_ACCOUNTS.find(
    (a) => a.email === email.trim().toLowerCase(),
  );
  return account ? [account.role] : [];
}

export default function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function performLogin(loginEmail: string, loginPassword: string) {
    setLoading(true);
    setError("");

    const normalizedEmail = loginEmail.trim().toLowerCase();
    const callbackFromQuery = normalizeCallbackPath(
      searchParams.get("callbackUrl"),
    );
    const roles = rolesForEmail(normalizedEmail);
    const destination =
      callbackFromQuery && callbackFromQuery !== "/login"
        ? callbackFromQuery
        : defaultPathForRoles(roles);

    const result = await signIn("credentials", {
      email: normalizedEmail,
      password: loginPassword,
      redirect: false,
    });

    if (result?.error) {
      setLoading(false);
      setError("Invalid email or password. Use demo1234 for all demo accounts.");
      return;
    }

    if (!result?.ok) {
      setLoading(false);
      setError("Sign in failed. Please try again.");
      return;
    }

    // Full navigation ensures the session cookie is applied before middleware runs.
    window.location.assign(destination);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await performLogin(email, password);
  }

  function quickLogin(accountEmail: string) {
    setEmail(accountEmail);
    setPassword("demo1234");
    void performLogin(accountEmail, "demo1234");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bone px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-evergreen">
            <PawPrint className="h-8 w-8" />
            <span className="text-2xl font-semibold">ResCutes</span>
          </Link>
          <p className="mt-2 text-sm text-graphite/70">Demo sign in</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Use a demo account to explore ResCutes</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="demo1234"
                  required
                />
              </div>
              {error && (
                <p className="text-sm text-rescue" role="alert">{error}</p>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6">
              <p className="text-xs font-medium text-graphite/70 mb-3">
                Quick demo access (password: demo1234)
              </p>
              <div className="flex flex-wrap gap-2">
                {DEMO_ACCOUNTS.map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    onClick={() => quickLogin(account.email)}
                    disabled={loading}
                    className="rounded-full border border-sage/40 px-3 py-1 text-xs hover:bg-bone transition-colors disabled:opacity-50"
                  >
                    {account.role.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
