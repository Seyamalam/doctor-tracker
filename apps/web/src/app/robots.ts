import type { MetadataRoute } from "next";

import { ENV } from "@/env";

const base = ENV.NEXT_PUBLIC_APP_URL || "https://doctor-tracker-tau-sage.vercel.app";

const robots = (): MetadataRoute.Robots => ({
  rules: { allow: "/", userAgent: "*" },
  sitemap: `${base}/sitemap.xml`,
});

export default robots;
