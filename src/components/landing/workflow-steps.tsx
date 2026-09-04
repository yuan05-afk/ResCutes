"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "motion/react";
import { cn } from "@/lib/utils";

const WORKFLOW = [
  {
    step: "01",
    title: "Report & Track",
    copy: "Citizens spot an animal in need, pin the location, and follow every status update from the field.",
    image: "/landing/report.jpg",
    alt: "Citizen reporting a cat near a Philippine wet market",
  },
  {
    step: "02",
    title: "Coordinate Rescue",
    copy: "Shelter staff verify the report, assign a rescuer, and route the animal to the right facility.",
    image: "/landing/rescue.jpg",
    alt: "Filipino rescuers loading an aspin into a soft crate",
  },
  {
    step: "03",
    title: "Medical Clearance",
    copy: "Veterinarians examine, document, and clear animals through a focused clinical workflow.",
    image: "/landing/medical.jpg",
    alt: "Filipino veterinarian examining an aspin in clinic",
  },
  {
    step: "04",
    title: "Adoption",
    copy: "Cleared animals move into adoption on web and mobile, so families can discover, apply, and bring them home.",
    image: "/landing/adoption-ready.jpg",
    alt: "Aspin dog receiving a new collar at a Philippine shelter",
  },
] as const;

const springSoft = {
  stiffness: 60,
  damping: 28,
  mass: 0.55,
  restDelta: 0.001,
} as const;

const sectionStagger: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.04 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", bounce: 0.2, duration: 0.7 },
  },
};

const stepReveal: Variants = {
  hidden: { opacity: 0, y: 56 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", bounce: 0.18, duration: 0.85 },
  },
};

const textStagger: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.11, delayChildren: 0.08 },
  },
};

function WorkflowStep({
  step,
  index,
}: {
  step: (typeof WORKFLOW)[number];
  index: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const imageLeft = index % 2 === 0;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Images drift slower; text drifts farther (moves faster) for depth.
  const imageY = useSpring(
    useTransform(
      scrollYProgress,
      [0, 1],
      reduceMotion ? [0, 0] : [28, -28],
    ),
    springSoft,
  );
  const mediaY = useSpring(
    useTransform(
      scrollYProgress,
      [0, 1],
      reduceMotion ? [0, 0] : [42, -42],
    ),
    springSoft,
  );
  const textY = useSpring(
    useTransform(
      scrollYProgress,
      [0, 1],
      reduceMotion ? [0, 0] : [78, -78],
    ),
    springSoft,
  );

  return (
    <motion.article
      ref={ref}
      className="grid items-center gap-8 md:grid-cols-12 md:gap-10"
      initial={reduceMotion ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount: 0.35, margin: "0px 0px -8% 0px" }}
      variants={stepReveal}
    >
      <motion.div
        className={cn(
          "relative md:col-span-7",
          !imageLeft && "md:order-2",
        )}
        style={{ y: imageY }}
      >
        <div className="landing-photo relative aspect-[4/3] overflow-hidden rounded-sm">
          <motion.div
            className="absolute inset-x-0 -top-[18%] -bottom-[18%] will-change-transform"
            style={{ y: mediaY }}
          >
            <Image
              src={step.image}
              alt={step.alt}
              fill
              quality={92}
              sizes="(max-width: 768px) 100vw, 58vw"
              className="object-cover"
              style={{
                objectPosition: index === 3 ? "center 35%" : "center",
              }}
            />
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        className={cn("md:col-span-5", !imageLeft && "md:order-1")}
        style={{ y: textY }}
        variants={textStagger}
      >
        <motion.p
          variants={fadeUp}
          className="landing-brand text-5xl leading-none text-sage/55 md:text-6xl"
        >
          {step.step}
        </motion.p>
        <motion.h3
          variants={fadeUp}
          className="landing-display mt-4 text-2xl text-evergreen md:text-3xl"
        >
          {step.title}
        </motion.h3>
        <motion.p
          variants={fadeUp}
          className="mt-4 max-w-md text-base leading-relaxed text-graphite/68"
        >
          {step.copy}
        </motion.p>
        {step.step === "04" ? (
          <motion.div variants={fadeUp} className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/mobile/adoption"
              className="inline-flex min-h-11 items-center rounded-md bg-evergreen px-4 text-sm font-semibold text-white transition hover:bg-evergreen/90"
            >
              Browse on mobile
            </Link>
            <Link
              href="/adoption"
              className="inline-flex min-h-11 items-center rounded-md border border-sage/40 bg-white px-4 text-sm font-semibold text-evergreen transition hover:bg-bone"
            >
              Staff adoption
            </Link>
          </motion.div>
        ) : null}
      </motion.div>
    </motion.article>
  );
}

export function WorkflowSteps() {
  return (
    <section className="bg-bone py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <motion.div
          className="max-w-2xl"
          variants={sectionStagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
        >
          <motion.p
            variants={fadeUp}
            className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-sage"
          >
            How it works
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="landing-display mt-3 text-[clamp(2rem,4vw,3rem)] leading-[1.1] text-evergreen"
          >
            One coordinated workflow
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-4 text-base leading-relaxed text-graphite/68 md:text-lg"
          >
            Four connected stages: report, rescue, medical clearance, and
            adoption. Every handoff stays visible from the barangay sidewalk to a
            forever home.
          </motion.p>
        </motion.div>

        <div className="mt-16 space-y-20 md:mt-24 md:space-y-28">
          {WORKFLOW.map((step, index) => (
            <WorkflowStep key={step.step} step={step} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
