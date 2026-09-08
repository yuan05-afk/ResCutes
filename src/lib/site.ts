/** Canonical public site URL for metadata, sitemap, and structured data. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://rescutes.vercel.app");

export const SITE_NAME = "ResCutes";

export const SITE_TAGLINE = "From report to rescue, care, and adoption.";

export const SITE_DESCRIPTION =
  "ResCutes connects citizens, rescuers, shelters, and veterinarians through one coordinated animal rescue workflow in the Philippines.";
