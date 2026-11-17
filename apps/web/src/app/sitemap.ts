import type { MetadataRoute } from "next";

import { baseUrl } from "@/lib/base-url";

const sitemap = (): MetadataRoute.Sitemap => [
  {
    changeFrequency: "monthly",
    lastModified: new Date(),
    priority: 1,
    url: baseUrl,
  },
];

export default sitemap;
