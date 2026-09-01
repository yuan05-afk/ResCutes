import Link from "next/link";
import { Camera, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReportCtaCard() {
  return (
    <div className="rounded-2xl border border-sage/25 bg-white p-6 shadow-card text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-evergreen shadow-elevated">
        <Camera className="h-7 w-7 text-white" aria-hidden />
      </div>
      <h2 className="mt-4 text-lg font-bold text-graphite leading-snug">
        Found an animal
        <br />
        that needs help?
      </h2>
      <Button size="lg" className="mt-5 w-full h-12 rounded-full text-base" asChild>
        <Link href="/mobile/report">Report an Animal</Link>
      </Button>
      <div className="mt-4 flex gap-2 rounded-xl bg-bone p-3 text-left">
        <Shield className="h-4 w-4 text-ochre shrink-0 mt-0.5" aria-hidden />
        <p className="text-xs text-graphite/70 leading-relaxed">
          For your safety, please don&apos;t approach injured, aggressive, trapped,
          or dangerous animals. Keep a safe distance and report from afar.
        </p>
      </div>
    </div>
  );
}
