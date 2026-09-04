import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "./login-form";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to ResCutes demo accounts for mobile field work or the web operations dashboard.",
  alternates: {
    canonical: `${SITE_URL}/login`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Loading...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
