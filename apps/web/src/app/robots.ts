import type { MetadataRoute } from "next";

import { baseUrl } from "@/lib/base-url";

const robots = (): MetadataRoute.Robots => ({
  rules: { allow: "/", userAgent: "*" },
  sitemap: `${baseUrl}/sitemap.xml`,
});

export default robots;
