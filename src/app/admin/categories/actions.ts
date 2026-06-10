"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import sharp from "sharp";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/slug";
import { uniqueSlug, storagePathFromPublicUrl } from "@/lib/unique-slug";

const BUCKET = "category-images";
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB

const schema = z.object({
  name: z.string().trim().min(2, "Emri është i detyrueshëm."),
  slug: z.string().trim().min(2, "Slug-u është i detyrueshëm."),
});

export type CategoryFormState =
  | { error?: string; success?: string; fieldErrors?: Record<string, string> }
  | undefined;

const SESSION_EXPIRED =
  "Sesioni juaj ka skaduar. Rifreskoni faqen dhe kyçuni përsëri.";

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : "Gabim i papritur.";
}

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
  if (!file.type.startsWith("image/")) {
    throw new Error("Skedari duhet të jetë imazh.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Imazhi është shumë i madh (max 8MB).");
  }
  const buf = Buffer.from(await file.arrayBuffer());
  let webp: Buffer;
  try {
    webp = await sharp(buf)
      .rotate()
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    // sharp can't decode this format (e.g. HEIC from an iPhone when the
    // browser couldn't convert it client-side).
    throw new Error(
      `Formati i imazhit "${file.name}" nuk mbështetet. Përdorni JPG, PNG ose WebP.`,
    );
  }

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
  try {
    await assertAdmin();
  } catch {
    return { error: SESSION_EXPIRED };
  }
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return {
      error: "Disa fusha janë të pavlefshme.",
      fieldErrors: Object.fromEntries(
        parsed.error.issues.map((i) => [i.path.join("."), i.message]),
      ),
    };
  }

  const admin = createAdminClient();
  const slug = await uniqueSlug(admin, "categories", parsed.data.slug);

  let image_url: string | null = null;
  const file = formData.get("image") as File | null;
  if (file && file.size > 0) {
    try {
      image_url = await uploadCategoryImage(slug, file);
    } catch (e) {
      return { error: `Ngarkimi i imazhit dështoi: ${errorMessage(e)}` };
    }
  }

  const { data, error } = await admin
    .from("categories")
    .insert({ ...parsed.data, slug, image_url })
    .select("id")
    .single();
  if (error) return { error: error.message };

  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  revalidatePath("/");
  redirect(`/admin/categories/${data.id}`);
}

export async function updateCategory(
  id: string,
  _prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  try {
    await assertAdmin();
  } catch {
    return { error: SESSION_EXPIRED };
  }
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return {
      error: "Disa fusha janë të pavlefshme.",
      fieldErrors: Object.fromEntries(
        parsed.error.issues.map((i) => [i.path.join("."), i.message]),
      ),
    };
  }

  const admin = createAdminClient();
  const slug = await uniqueSlug(admin, "categories", parsed.data.slug, id);

  const update: Record<string, unknown> = { ...parsed.data, slug };
  let oldPath: string | null = null;
  const file = formData.get("image") as File | null;
  if (file && file.size > 0) {
    // Remember the current image so we can remove it after a successful swap.
    const { data: existing } = await admin
      .from("categories")
      .select("image_url")
      .eq("id", id)
      .maybeSingle();
    oldPath = storagePathFromPublicUrl(existing?.image_url, BUCKET);
    try {
      update.image_url = await uploadCategoryImage(slug, file);
    } catch (e) {
      return { error: `Ngarkimi i imazhit dështoi: ${errorMessage(e)}` };
    }
  }

  const { error } = await admin.from("categories").update(update).eq("id", id);
  if (error) return { error: error.message };

  // Clean up the replaced image so storage doesn't accumulate orphans.
  if (oldPath) {
    await admin.storage.from(BUCKET).remove([oldPath]);
  }

  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  revalidatePath("/");
  return { success: "Ndryshimet u ruajtën." };
}

export async function deleteCategory(id: string) {
  await assertAdmin();
  const admin = createAdminClient();

  // Remove the category's image from storage too (products in the category
  // are kept; their category_id is set null by the FK).
  const { data: existing } = await admin
    .from("categories")
    .select("image_url")
    .eq("id", id)
    .maybeSingle();
  const path = storagePathFromPublicUrl(existing?.image_url, BUCKET);

  await admin.from("categories").delete().eq("id", id);
  if (path) {
    await admin.storage.from(BUCKET).remove([path]);
  }

  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  revalidatePath("/");
  redirect("/admin/categories");
}
