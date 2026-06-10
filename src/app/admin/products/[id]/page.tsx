import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";

export const metadata = { title: "Ndrysho produktin — Admin" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: product }, { data: categories }, { data: images }] =
    await Promise.all([
      supabase.from("products").select("*").eq("id", id).single(),
      supabase.from("categories").select("id, name").order("name"),
      supabase
        .from("product_images")
        .select("id, image_url, position")
        .eq("product_id", id),
    ]);

  if (!product) notFound();

  return (
    <>
      <AdminPageHeader
        eyebrow="Produktet"
        title={product.name}
        backHref="/admin/products"
        backLabel="Produktet"
      />
      <ProductForm
        mode="edit"
        product={product}
        categories={categories ?? []}
        images={images ?? []}
      />
    </>
  );
}
