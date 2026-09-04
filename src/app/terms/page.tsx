import type { Metadata } from "next";
import Link from "next/link";
import { TermsParts } from "@/components/legal/terms-sheet";
import { TERMS_OF_USE } from "@/lib/legal/terms";
import { PawPrint } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of use | ResCutes",
  description:
    "Terms of use for the ResCutes animal rescue coordination demo.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-bone">
      <header className="border-b border-sage/25 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-evergreen"
          >
            <PawPrint className="h-6 w-6" />
            <span className="text-lg font-semibold">ResCutes</span>
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-evergreen hover:underline"
          >
            Sign In
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-10 md:py-14">
        <h1 className="text-3xl font-semibold tracking-tight text-evergreen">
          {TERMS_OF_USE.title}
        </h1>
        <p className="mt-2 text-sm text-graphite/65">
          Short, plain-language terms for using the ResCutes demo.
        </p>
        <div className="mt-8 rounded-xl border border-sage/25 bg-white p-5 md:p-6">
          <TermsParts />
        </div>
        <p className="mt-6 text-sm text-graphite/60">
          <Link href="/" className="font-medium text-evergreen hover:underline">
            Back to home
          </Link>
        </p>
      </main>
    </div>
  );
}
