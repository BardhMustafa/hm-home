import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";

export const metadata = { title: "Produkt i ri — Admin" };

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  return (
    <>
      <AdminPageHeader eyebrow="Produktet" title="Produkt i ri" />
      <ProductForm mode="create" categories={categories ?? []} />
    </>
  );
}
