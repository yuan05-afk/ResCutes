"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "motion/react";
import { Bricolage_Grotesque, Manrope } from "next/font/google";
import { DEMO_ACCOUNTS, ROLE_LABELS, type Role } from "@/lib/auth/permissions";
import { ParallaxBackground } from "@/components/landing/parallax-media";
import { WorkflowSteps } from "@/components/landing/workflow-steps";
import { cn } from "@/lib/utils";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-landing-display",
  display: "swap",
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-landing-body",
  display: "swap",
});

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", bounce: 0.22, duration: 0.75 },
  },
};

const stagger: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

export function LandingPage() {
  const reduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);

  const { scrollYProgress: pageProgress } = useScroll();
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroYRaw = useTransform(
    heroProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [0, 280],
  );
  const heroScaleRaw = useTransform(
    heroProgress,
    [0, 1],
    reduceMotion ? [1, 1] : [1.14, 1.02],
  );
  const heroTextYRaw = useTransform(
    heroProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [0, 90],
  );
  const heroFadeRaw = useTransform(
    heroProgress,
    [0, 0.7],
    reduceMotion ? [1, 1] : [1, 0.15],
  );

  const heroY = useSpring(heroYRaw, {
    stiffness: 55,
    damping: 28,
    mass: 0.7,
  });
  const heroScale = useSpring(heroScaleRaw, {
    stiffness: 55,
    damping: 28,
    mass: 0.7,
  });
  const heroTextY = useSpring(heroTextYRaw, {
    stiffness: 70,
    damping: 30,
    mass: 0.55,
  });
  const heroFade = useSpring(heroFadeRaw, {
    stiffness: 80,
    damping: 30,
  });

  const progressWidth = useTransform(pageProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        display.variable,
        body.variable,
        "landing-page min-h-screen bg-bone text-graphite antialiased",
      )}
    >
      <motion.div
        className="landing-progress fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-ochre"
        style={{ width: progressWidth }}
        aria-hidden
      />

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background,box-shadow,backdrop-filter] duration-300",
          scrolled
            ? "border-b border-sage/20 bg-bone/90 shadow-sm backdrop-blur-md"
            : "bg-transparent",
        )}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
          <Link
            href="/"
            className={cn(
              "landing-brand text-lg tracking-tight transition-colors md:text-xl",
              scrolled ? "text-evergreen" : "text-white",
            )}
          >
            ResCutes
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3" aria-label="Primary">
            <Link
              href="#demo"
              className={cn(
                "hidden min-h-11 items-center rounded-md px-3 text-sm font-medium transition sm:inline-flex",
                scrolled
                  ? "text-graphite/75 hover:bg-evergreen/5 hover:text-evergreen"
                  : "text-white/90 hover:bg-white/10 hover:text-white",
              )}
            >
              Demo Access
            </Link>
            <Link
              href="/login"
              className={cn(
                "inline-flex min-h-11 items-center rounded-md px-4 text-sm font-semibold transition",
                scrolled
                  ? "bg-evergreen text-white hover:bg-evergreen/90"
                  : "bg-white text-evergreen hover:bg-bone",
              )}
            >
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      <main id="main-content">
        <section
          ref={heroRef}
          className="relative isolate min-h-[100svh] overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 will-change-transform"
            style={{ y: heroY, scale: heroScale }}
          >
            <Image
              src="/landing/hero.jpg"
              alt="Filipino woman helping an aspin on a barangay street with a jeepney nearby"
              fill
              priority
              quality={95}
              sizes="100vw"
              className="object-cover object-[center_30%]"
            />
          </motion.div>
          <div className="landing-hero-scrim absolute inset-0" aria-hidden />

          <motion.div
            className="relative z-10 flex min-h-[100svh] flex-col justify-end pb-14 pt-28 md:justify-center md:pb-24 md:pt-28"
            style={{ y: heroTextY, opacity: heroFade }}
          >
            <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
              <motion.div
                className="max-w-2xl text-white"
                variants={stagger}
                initial={reduceMotion ? false : "hidden"}
                animate="show"
              >
                <motion.p
                  variants={fadeUp}
                  className="mb-5 text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-white/80"
                >
                  Philippine animal rescue coordination
                </motion.p>
                <motion.p
                  variants={fadeUp}
                  className="landing-brand text-[clamp(3.25rem,10vw,6.75rem)] leading-[0.9] tracking-[-0.04em]"
                >
                  ResCutes
                </motion.p>
                <motion.h1
                  variants={fadeUp}
                  className="landing-display mt-5 max-w-xl text-balance text-[clamp(1.55rem,3.4vw,2.35rem)] font-medium leading-[1.2] text-white"
                >
                  From report to safe shelter intake
                </motion.h1>
                <motion.p
                  variants={fadeUp}
                  className="mt-5 max-w-lg text-[0.98rem] leading-relaxed text-white/90 sm:text-lg"
                >
                  One coordinated workflow for citizens, rescuers, shelters, and
                  veterinarians, from a street report through medical clearance
                  and into adoption.
                </motion.p>
                <motion.div
                  variants={fadeUp}
                  className="mt-9 flex flex-wrap gap-3"
                >
                  <Link
                    href="#demo"
                    className="inline-flex min-h-12 items-center justify-center rounded-md bg-white px-6 text-sm font-semibold text-evergreen transition hover:bg-bone"
                  >
                    Try Demo Access
                  </Link>
                  <Link
                    href="/mobile"
                    className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/40 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/18"
                  >
                    Open Mobile App
                  </Link>
                </motion.div>
              </motion.div>
            </div>

            <motion.div
              className="mx-auto mt-12 flex w-full max-w-6xl flex-col items-start gap-2 px-4 text-white/55 md:mt-16 md:px-6"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.6 }}
            >
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.22em]">
                Scroll to explore
              </span>
              <motion.span
                className="h-10 w-px bg-gradient-to-b from-white/70 to-transparent"
                animate={
                  reduceMotion
                    ? undefined
                    : { scaleY: [0.55, 1, 0.55], opacity: [0.35, 0.9, 0.35] }
                }
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                style={{ originY: 0 }}
                aria-hidden
              />
            </motion.div>
          </motion.div>
        </section>

        <WorkflowSteps />

        <section className="relative isolate min-h-[70vh] overflow-hidden md:min-h-[78vh]">
          <ParallaxBackground
            src="/landing/community.jpg"
            alt="Quezon City residential street at dusk with a rescuer and aspin"
            overlayClassName="bg-[linear-gradient(108deg,rgba(10,26,22,0.82)_0%,rgba(10,26,22,0.68)_55%,rgba(10,26,22,0.55)_100%)]"
            intensity={0.3}
          />
          <div className="relative mx-auto flex min-h-[70vh] max-w-6xl items-center px-4 py-24 md:min-h-[78vh] md:px-6 md:py-32">
            <motion.div
              className="max-w-2xl text-white"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.4 }}
              variants={stagger}
            >
              <motion.p
                variants={fadeUp}
                className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-white/80"
              >
                Built for the Philippines
              </motion.p>
              <motion.h2
                variants={fadeUp}
                className="landing-display mt-4 text-[clamp(2rem,4.2vw,3.15rem)] leading-[1.1]"
              >
                Field-ready on mobile. Operations-ready on web.
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mt-5 text-base leading-relaxed text-white/90 md:text-lg"
              >
                Citizens and rescuers work from the street. Shelter staff and
                veterinarians run verification, intake, medical clearance, and
                adoption from the dashboard. Same data. Different jobs.
              </motion.p>
              <motion.div
                variants={fadeUp}
                className="mt-10 grid gap-4 sm:grid-cols-2"
              >
                <Link
                  href="/dashboard"
                  className="group rounded-md border border-white/25 bg-white/10 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-md transition hover:border-white/40 hover:bg-white/16"
                >
                  <p className="landing-display text-lg text-white">
                    Web dashboard
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-white/85">
                    Cases, shelters, medical clearance, and adoption operations.
                  </p>
                  <span className="mt-4 inline-flex text-sm font-medium text-white/90 group-hover:underline">
                    Open dashboard
                  </span>
                </Link>
                <Link
                  href="/mobile"
                  className="group rounded-md border border-white/25 bg-white/10 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-md transition hover:border-white/40 hover:bg-white/16"
                >
                  <p className="landing-display text-lg text-white">
                    Mobile app
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-white/85">
                    Report, rescue, and discover animals ready for adoption.
                  </p>
                  <span className="mt-4 inline-flex text-sm font-medium text-white/90 group-hover:underline">
                    Open mobile app
                  </span>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section id="demo" className="bg-white py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <motion.div
              className="mx-auto max-w-2xl text-center"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.45 }}
              variants={stagger}
            >
              <motion.p
                variants={fadeUp}
                className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-sage"
              >
                Try it now
              </motion.p>
              <motion.h2
                variants={fadeUp}
                className="landing-display mt-3 text-[clamp(2rem,4vw,3rem)] text-evergreen"
              >
                Demo Access
              </motion.h2>
              <motion.p
                variants={fadeUp}
                className="mt-4 text-base leading-relaxed text-graphite/68 md:text-lg"
              >
                Explore ResCutes with seeded accounts. Password for all accounts:{" "}
                <code className="rounded bg-bone px-1.5 py-0.5 font-semibold text-evergreen">
                  demo1234
                </code>
              </motion.p>
            </motion.div>

            <motion.ul
              className="mt-12 divide-y divide-sage/25 border-y border-sage/25"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={stagger}
            >
              {DEMO_ACCOUNTS.map((account) => (
                <motion.li key={account.email} variants={fadeUp}>
                  <Link
                    href={`/login?email=${encodeURIComponent(account.email)}`}
                    className="group flex flex-col gap-2 py-5 transition hover:bg-bone/70 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-3"
                  >
                    <div>
                      <p className="landing-display text-lg text-evergreen">
                        {account.name}
                      </p>
                      <p className="mt-0.5 text-sm text-graphite/70">
                        {ROLE_LABELS[account.role as Role] ??
                          account.role.replace("_", " ")}
                      </p>
                      <p className="mt-2 text-sm text-graphite/70">
                        {account.description}
                      </p>
                    </div>
                    <code className="text-xs text-evergreen/85 transition group-hover:text-evergreen sm:shrink-0">
                      {account.email}
                    </code>
                  </Link>
                </motion.li>
              ))}
            </motion.ul>

            <motion.div
              className="mt-10 flex justify-center"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.7 }}
            >
              <Link
                href="/login"
                className="inline-flex min-h-12 items-center justify-center rounded-md bg-evergreen px-8 text-sm font-semibold text-white transition hover:bg-evergreen/90"
              >
                Sign In to Demo
              </Link>
            </motion.div>
          </div>
        </section>

        <footer className="border-t border-sage/25 bg-bone py-8">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 text-center text-sm leading-relaxed text-graphite/75 md:px-6">
            <p>
              No sample rescue cases are loaded. Submit a report from the mobile
              app to start testing the workflow. Not connected to live rescue
              services.
            </p>
            <Link
              href="/terms"
              className="font-medium text-evergreen underline-offset-2 hover:underline"
            >
              Terms of use
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
