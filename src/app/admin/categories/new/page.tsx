import { AdminPageHeader } from "@/components/admin/page-header";
import { CategoryForm } from "@/components/admin/category-form";

export const metadata = { title: "Kategori e re — Admin" };

export default function NewCategoryPage() {
  return (
    <>
      <AdminPageHeader
        eyebrow="Kategoritë"
        title="Kategori e re"
        backHref="/admin/categories"
        backLabel="Kategoritë"
      />
      <CategoryForm mode="create" />
    </>
  );
}
