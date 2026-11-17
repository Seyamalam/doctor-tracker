import type { MetadataRoute } from "next";

const sitemap = (): MetadataRoute.Sitemap => [
  { changeFrequency: "monthly", lastModified: new Date(), priority: 1, url: "/" },
];

export default sitemap;
