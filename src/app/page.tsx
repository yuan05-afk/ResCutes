import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DEMO_ACCOUNTS } from "@/lib/auth/permissions";
import { PawPrint, Shield, MapPin, Heart } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bone">
      <header className="border-b border-sage/30 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
          <div className="flex items-center gap-2">
            <PawPrint className="h-7 w-7 text-evergreen" />
            <span className="text-xl font-semibold text-evergreen">ResCutes</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/login">Demo Access</Link>
            </Button>
            <Button asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-evergreen md:text-5xl">
                From report to safe shelter intake
              </h1>
              <p className="mt-4 text-lg text-graphite/80">
                ResCutes connects citizens, rescuers, shelters, and veterinarians
                through one coordinated workflow, from animal reporting to medical
                clearance.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" asChild>
                  <Link href="/login">Try Demo Access</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/mobile">Mobile App</Link>
                </Button>
              </div>
            </div>
            <div className="grid gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-evergreen" />
                    <CardTitle className="text-base">Report & Track</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Citizens report animals in need and track rescue progress safely.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-evergreen" />
                    <CardTitle className="text-base">Coordinate Rescue</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Staff verify reports, assign rescuers, and route animals to suitable shelters.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-evergreen" />
                    <CardTitle className="text-base">Medical Clearance</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Veterinarians record examinations and clearance through a focused workflow.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="border-t border-sage/30 bg-white py-16">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <h2 className="text-2xl font-semibold text-evergreen">Demo Access</h2>
            <p className="mt-2 text-graphite/70">
              Use these seeded accounts to explore ResCutes. Password for all accounts:{" "}
              <code className="rounded bg-bone px-1.5 py-0.5 text-sm">demo1234</code>
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {DEMO_ACCOUNTS.map((account) => (
                <Card key={account.email}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{account.name}</CardTitle>
                    <CardDescription>{account.role.replace("_", " ")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-graphite/70 mb-2">{account.description}</p>
                    <code className="text-xs text-evergreen">{account.email}</code>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Button size="lg" asChild>
                <Link href="/login">Sign In to Demo</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="border-t border-sage/30 py-8">
          <div className="mx-auto max-w-6xl px-4 text-center text-sm text-graphite/60 md:px-6">
            No sample rescue cases are loaded. Submit a report from the mobile app to
            start testing the workflow. Not connected to live rescue services.
          </div>
        </section>
      </main>
    </div>
  );
}
