"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import sharp from "sharp";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/slug";

const BUCKET = "category-images";

const schema = z.object({
  name: z.string().trim().min(2, "Emri është i detyrueshëm."),
  slug: z.string().trim().min(2, "Slug-u është i detyrueshëm."),
});

export type CategoryFormState =
  | { error?: string; fieldErrors?: Record<string, string> }
  | undefined;

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") throw new Error("Forbidden");
}

async function uploadCategoryImage(slug: string, file: File) {
  const buf = Buffer.from(await file.arrayBuffer());
  const webp = await sharp(buf)
    .rotate()
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  const path = `${slug}/${Date.now()}.webp`;
  const admin = createAdminClient();
  const { error } = await admin.storage.from(BUCKET).upload(path, webp, {
    contentType: "image/webp",
    cacheControl: "31536000",
    upsert: true,
  });
  if (error) throw error;
  const {
    data: { publicUrl },
  } = admin.storage.from(BUCKET).getPublicUrl(path);
  return publicUrl;
}

function parseForm(formData: FormData) {
  const nameStr = String(formData.get("name") ?? "");
  const slugRaw = String(formData.get("slug") ?? "").trim() || nameStr;
  return schema.safeParse({ name: nameStr, slug: slugify(slugRaw) });
}

export async function createCategory(
  _prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  await assertAdmin();
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return {
      error: "Disa fusha janë të pavlefshme.",
      fieldErrors: Object.fromEntries(
        parsed.error.issues.map((i) => [i.path.join("."), i.message]),
      ),
    };
  }

  let image_url: string | null = null;
  const file = formData.get("image") as File | null;
  if (file && file.size > 0) {
    image_url = await uploadCategoryImage(parsed.data.slug, file);
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("categories")
    .insert({ ...parsed.data, image_url })
    .select("id")
    .single();
  if (error) return { error: error.message };

  revalidatePath("/admin/categories");
  revalidatePath("/");
  redirect(`/admin/categories/${data.id}`);
}

export async function updateCategory(
  id: string,
  _prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  await assertAdmin();
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return {
      error: "Disa fusha janë të pavlefshme.",
      fieldErrors: Object.fromEntries(
        parsed.error.issues.map((i) => [i.path.join("."), i.message]),
      ),
    };
  }

  const update: Record<string, unknown> = { ...parsed.data };
  const file = formData.get("image") as File | null;
  if (file && file.size > 0) {
    update.image_url = await uploadCategoryImage(parsed.data.slug, file);
  }

  const admin = createAdminClient();
  const { error } = await admin.from("categories").update(update).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return undefined;
}

export async function deleteCategory(id: string) {
  await assertAdmin();
  const admin = createAdminClient();
  await admin.from("categories").delete().eq("id", id);
  revalidatePath("/admin/categories");
  revalidatePath("/");
  redirect("/admin/categories");
}
