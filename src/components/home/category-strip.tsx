import { getHomepageCategories, getProductsByCategorySlugs } from "@/lib/products";
import { CategoriesSection } from "./categories-section";

const FALLBACK = [
  { name: "Kuzhina", slug: "kuzhina", productCount: 42, image_url: null },
  { name: "Divane", slug: "divane", productCount: 68, image_url: null },
  { name: "Dhoma Gjumi", slug: "dhoma-gjumi", productCount: 31, image_url: null },
  { name: "Dekor", slug: "dekor", productCount: 124, image_url: null },
];

export async function CategoryStrip() {
  const real = await getHomepageCategories();
  const cats = real.length >= 2 ? real.slice(0, 4) : FALLBACK;
  const slugs = cats.map((c) => c.slug);
  const productsByCat = await getProductsByCategorySlugs(slugs, 1);
  return <CategoriesSection cats={cats} productsByCat={productsByCat} />;
}
