import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hmhome.al";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from("products").select("slug, updated_at"),
    supabase.from("categories").select("slug"),
  ]);

  const productRoutes = (products ?? []).map((p) => ({
    url: `${SITE}/product/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
  }));

  const categoryRoutes = (categories ?? []).map((c) => ({
    url: `${SITE}/shop?cat=${c.slug}`,
    lastModified: new Date(),
  }));

  return [
    { url: SITE, lastModified: new Date() },
    { url: `${SITE}/shop`, lastModified: new Date() },
    ...categoryRoutes,
    ...productRoutes,
  ];
}
