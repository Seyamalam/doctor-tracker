import type { MetadataRoute } from "next";

import { ENV } from "@/env";

const base = ENV.NEXT_PUBLIC_APP_URL || "https://doctor-tracker-tau-sage.vercel.app";

const sitemap = (): MetadataRoute.Sitemap => [
  {
    changeFrequency: "monthly",
    lastModified: new Date(),
    priority: 1,
    url: base,
  },
];

export default sitemap;
