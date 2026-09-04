"use client";

import Image from "next/image";
import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { cn } from "@/lib/utils";

type ParallaxMediaProps = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  /** How far the image travels relative to scroll. 0.2 = gentle, 0.4 = stronger. */
  intensity?: number;
  priority?: boolean;
  objectPosition?: string;
};

/**
 * Classic scroll parallax: the frame stays put while a taller image
 * drifts more slowly than page scroll, softened with a spring.
 */
export function ParallaxMedia({
  src,
  alt,
  sizes,
  className,
  intensity = 0.28,
  priority = false,
  objectPosition = "center",
}: ParallaxMediaProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const travel = Math.round(110 * intensity);

  const { scrollYProgress } = useScroll({
    target: frameRef,
    offset: ["start end", "end start"],
  });

  const rawY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [travel, -travel],
  );
  const y = useSpring(rawY, {
    stiffness: 70,
    damping: 26,
    mass: 0.55,
    restDelta: 0.001,
  });

  return (
    <div
      ref={frameRef}
      className={cn("landing-photo relative overflow-hidden", className)}
    >
      <motion.div
        className="absolute inset-x-0 -top-[22%] -bottom-[22%] will-change-transform"
        style={{ y }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          quality={92}
          sizes={sizes}
          className="object-cover"
          style={{ objectPosition }}
        />
      </motion.div>
    </div>
  );
}

type ParallaxBackgroundProps = {
  src: string;
  alt: string;
  className?: string;
  overlayClassName?: string;
  intensity?: number;
};

/** Full-bleed background parallax for section atmospheres. */
export function ParallaxBackground({
  src,
  alt,
  className,
  overlayClassName,
  intensity = 0.22,
}: ParallaxBackgroundProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const travel = Math.round(160 * intensity);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const rawY = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [travel, -travel],
  );
  const y = useSpring(rawY, {
    stiffness: 55,
    damping: 28,
    mass: 0.65,
    restDelta: 0.001,
  });
  const scale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    reduceMotion ? [1, 1, 1] : [1.12, 1.06, 1.12],
  );

  return (
    <div ref={sectionRef} className={cn("absolute inset-0 overflow-hidden", className)}>
      <motion.div
        className="absolute inset-x-0 -top-[18%] -bottom-[18%] will-change-transform"
        style={{ y, scale }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          quality={92}
          sizes="100vw"
          className="object-cover object-center"
        />
      </motion.div>
      {overlayClassName ? (
        <div className={cn("absolute inset-0", overlayClassName)} aria-hidden />
      ) : null}
    </div>
  );
}
