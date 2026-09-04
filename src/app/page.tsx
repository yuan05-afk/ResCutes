import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";

export const metadata: Metadata = {
  title: "ResCutes | From report to safe shelter intake",
  description:
    "ResCutes connects citizens, rescuers, shelters, and veterinarians through one coordinated animal rescue workflow.",
};

export default function HomePage() {
  return <LandingPage />;
}
