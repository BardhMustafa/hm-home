import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { CategoryForm } from "@/components/admin/category-form";

export const metadata = { title: "Ndrysho kategorinë — Admin" };

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();

  if (!category) notFound();

  return (
    <>
      <AdminPageHeader
        eyebrow="Kategoritë"
        title={category.name}
        backHref="/admin/categories"
        backLabel="Kategoritë"
      />
      <CategoryForm mode="edit" category={category} />
    </>
  );
}
