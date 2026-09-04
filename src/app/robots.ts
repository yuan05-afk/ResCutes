import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/terms"],
        disallow: [
          "/dashboard",
          "/mobile/",
          "/animals/",
          "/rescue-cases/",
          "/medical/",
          "/adoption/",
          "/shelters/",
          "/settings/",
          "/profile/",
          "/unauthorized",
          "/api/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
