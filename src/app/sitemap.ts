import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: "https://flekcuts.cz/", lastModified: new Date() }];
}
