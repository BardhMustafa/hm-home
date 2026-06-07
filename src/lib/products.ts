// Shared product fetching used by both the homepage and /shop.
import { createClient } from "@/lib/supabase/server";
import { hasSupabase } from "@/lib/supabase/env";
import type { ProductCardData } from "@/components/home/product-card";

// Lightweight category list for the header / mobile nav, so the navigation
// always reflects the real categories (and their real slugs) in the DB.
export async function getNavCategories(): Promise<
  { name: string; slug: string }[]
> {
  if (!hasSupabase()) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("name, slug")
    .order("name");
  return data ?? [];
}

type RawImage = { image_url: string; position: number };
type RawCategoryRef = { name: string } | { name: string }[] | null;

type RawProductRow = {
  id: string;
  name: string;
  slug: string;
  price: number;
  discount_price: number | null;
  stock: number | null;
  featured: boolean;
  category: RawCategoryRef;
  images: RawImage[] | null;
};

function categoryName(c: RawCategoryRef): string | null {
  if (!c) return null;
  if (Array.isArray(c)) return c[0]?.name ?? null;
  return c.name;
}

function toCard(p: RawProductRow): ProductCardData {
  const first = [...(p.images ?? [])].sort((a, b) => a.position - b.position)[0];
  const hasDiscount =
    typeof p.discount_price === "number" && p.discount_price < Number(p.price);
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: categoryName(p.category) ?? "HM Home",
    price: hasDiscount ? Number(p.discount_price) : Number(p.price),
    was: hasDiscount ? Number(p.price) : null,
    badge: hasDiscount ? "sale" : null,
    image: first?.image_url ?? null,
    stock: p.stock,
  };
}

export async function getFeaturedProducts(limit = 4): Promise<ProductCardData[]> {
  if (!hasSupabase()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, slug, price, discount_price, stock, featured, category:categories(name), images:product_images(image_url, position)",
    )
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return (data as RawProductRow[]).map(toCard);
}

export type ShopFilters = {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price-asc" | "price-desc";
  avail?: "stock" | "order";   // stock = in stock, order = made-to-order (stock IS NULL)
  onSale?: boolean;
};

export async function getShopProducts(filters: ShopFilters = {}) {
  if (!hasSupabase()) return [];
  const supabase = await createClient();

  let q = supabase
    .from("products")
    .select(
      "id, name, slug, price, discount_price, stock, featured, category:categories!inner(name, slug), images:product_images(image_url, position)",
    )
    .order("created_at", { ascending: false });

  // Single-column predicates stay in SQL.
  if (filters.category) q = q.eq("category.slug", filters.category);
  if (filters.avail === "stock") q = q.gt("stock", 0);
  if (filters.avail === "order") q = q.is("stock", null);

  const { data, error } = await q;
  if (error || !data) return [];

  let cards = (data as RawProductRow[]).map(toCard);

  // Price filtering, sorting, and "on sale" are evaluated on the EFFECTIVE
  // price (the discounted price when a product is actually on sale) — i.e.
  // what the shopper sees — not the raw `price` column. PostgREST can't
  // compare/sort on that computed value, so it's done here. `badge === "sale"`
  // is exactly `discount_price < price`, so it also excludes bogus discounts
  // (discount_price >= price).
  if (filters.onSale) cards = cards.filter((c) => c.badge === "sale");
  if (typeof filters.minPrice === "number") {
    const min = filters.minPrice;
    cards = cards.filter((c) => c.price >= min);
  }
  if (typeof filters.maxPrice === "number") {
    const max = filters.maxPrice;
    cards = cards.filter((c) => c.price <= max);
  }

  if (filters.sort === "price-asc") cards.sort((a, b) => a.price - b.price);
  else if (filters.sort === "price-desc") cards.sort((a, b) => b.price - a.price);
  // default: newest first — already ordered by created_at in the query.

  return cards;
}

// Product detail — full row + ordered images + related.
export type ProductDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  discount_price: number | null;
  sku: string | null;
  stock: number | null;
  category: { name: string; slug: string } | null;
  images: { image_url: string; position: number }[];
};

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  if (!hasSupabase()) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(
      "id, name, slug, description, price, discount_price, sku, stock, category_id, category:categories(name, slug), images:product_images(image_url, position)",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!data) return null;
  // Supabase's PostgREST returns a to-one relation as either {…} or [{…}]
  // depending on filter shape; reading either side is fine, the type system
  // just doesn't know that.
  const catRef = data.category as
    | { name: string; slug: string }
    | { name: string; slug: string }[]
    | null;
  const cat = categoryName(catRef);
  const catSlug = Array.isArray(catRef) ? catRef[0]?.slug : catRef?.slug;

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description,
    price: Number(data.price),
    discount_price: data.discount_price !== null ? Number(data.discount_price) : null,
    sku: data.sku,
    stock: data.stock,
    category: cat && catSlug ? { name: cat, slug: catSlug } : null,
    images: [...((data.images as RawImage[] | null) ?? [])].sort(
      (a, b) => a.position - b.position,
    ),
  };
}

export async function getRelatedProducts(
  productId: string,
  categoryId: string | null,
  limit = 4,
): Promise<ProductCardData[]> {
  if (!categoryId || !hasSupabase()) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(
      "id, name, slug, price, discount_price, stock, featured, category:categories(name), images:product_images(image_url, position)",
    )
    .eq("category_id", categoryId)
    .neq("id", productId)
    .limit(limit);
  if (!data) return [];
  return (data as RawProductRow[]).map(toCard);
}

// Categories — used by the homepage strip and shop filters.
export type HomepageCategory = {
  name: string;
  slug: string;
  productCount: number;
  image_url: string | null;
};

export async function getHomepageCategories(): Promise<HomepageCategory[]> {
  if (!hasSupabase()) return [];
  const supabase = await createClient();
  // Two-step: pull categories then count products by category. PostgREST
  // can do this in one call with !inner+count but the syntax is brittle —
  // two trivial queries is clearer and just as fast on this scale.
  const { data: cats } = await supabase
    .from("categories")
    .select("name, slug, image_url")
    .order("name");
  if (!cats?.length) return [];

  const { data: counts } = await supabase.from("products").select("category_id");
  const byCat = new Map<string | null, number>();
  for (const row of counts ?? []) {
    byCat.set(row.category_id, (byCat.get(row.category_id) ?? 0) + 1);
  }

  // Re-fetch category ids so we can join client-side. Tiny table.
  const { data: catIds } = await supabase.from("categories").select("id, slug");
  const slugToCount = new Map<string, number>();
  for (const c of catIds ?? []) {
    slugToCount.set(c.slug, byCat.get(c.id) ?? 0);
  }

  return cats.map((c) => ({
    ...c,
    productCount: slugToCount.get(c.slug) ?? 0,
  }));
}

// Fetch up to `limit` products for each of the given category slugs.
// Returns a map of slug → ProductCardData[].
export async function getProductsByCategorySlugs(
  slugs: string[],
  limit = 2,
): Promise<Record<string, ProductCardData[]>> {
  if (!hasSupabase() || !slugs.length) return {};
  const supabase = await createClient();

  const { data: catRows } = await supabase
    .from("categories")
    .select("id, slug")
    .in("slug", slugs);
  if (!catRows?.length) return {};

  const result: Record<string, ProductCardData[]> = {};
  await Promise.all(
    catRows.map(async (cat) => {
      const { data } = await supabase
        .from("products")
        .select(
          "id, name, slug, price, discount_price, stock, featured, category:categories(name), images:product_images(image_url, position)",
        )
        .eq("category_id", cat.id)
        .limit(limit);
      result[cat.slug] = (data as RawProductRow[] ?? []).map(toCard);
    }),
  );
  return result;
}
