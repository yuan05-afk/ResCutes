import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-[100svh] flex-col items-center justify-center bg-bone px-4">
      <div className="w-full max-w-md rounded-xl border border-sage/25 bg-white p-8 text-center shadow-card">
        <div className="mb-4 flex justify-center">
          <Logo size="lg" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-evergreen/70">
          404
        </p>
        <h1 className="mt-2 text-xl font-bold text-graphite">
          Page not found
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-graphite/65">
          That link does not match a ResCutes page. Check the URL or return
          home to continue.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link href="/">Home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
