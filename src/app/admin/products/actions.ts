"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import sharp from "sharp";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/slug";
import { uniqueSlug } from "@/lib/unique-slug";

const PRODUCT_BUCKET = "product-images";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB per image

const productSchema = z
  .object({
    name: z.string().trim().min(2, "Emri është i detyrueshëm."),
    slug: z.string().trim().min(2, "Slug-u është i detyrueshëm."),
    description: z.string().trim().optional().nullable(),
    price: z.coerce.number().min(0, "Çmimi nuk mund të jetë negativ."),
    discount_price: z.coerce.number().min(0).optional().nullable(),
    stock: z.preprocess(
      (v) => (v === "" || v === null || v === undefined ? null : v),
      z.coerce.number().int().min(0, "Stoku nuk mund të jetë negativ.").nullable(),
    ),
    featured: z.coerce.boolean().optional().default(false),
    category_id: z.string().uuid().optional().nullable(),
  })
  .refine((d) => d.discount_price == null || d.discount_price < d.price, {
    message: "Zbritja duhet të jetë më e vogël se çmimi.",
    path: ["discount_price"],
  });

export type ProductFormState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
} | undefined;

// Assert the caller is an authenticated admin. Throws on failure so the
// server action surfaces a generic error to the client instead of leaking
// auth state.
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

const SESSION_EXPIRED =
  "Sesioni juaj ka skaduar. Rifreskoni faqen dhe kyçuni përsëri.";

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : "Gabim i papritur.";
}

function parseProductForm(formData: FormData) {
  const raw = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || null,
    price: formData.get("price"),
    discount_price: formData.get("discount_price") || null,
    stock: formData.get("stock") || null,
    featured: formData.get("featured") === "on",
    category_id: formData.get("category_id") || null,
  };

  // Normalize the slug. If the user left it blank, derive from the name.
  const nameStr = typeof raw.name === "string" ? raw.name : "";
  const slugStr = typeof raw.slug === "string" && raw.slug.trim() ? raw.slug : nameStr;
  raw.slug = slugify(slugStr);

  // Treat empty-string category as null (the <select>'s blank option).
  if (raw.category_id === "") raw.category_id = null;

  return productSchema.safeParse(raw);
}

// Upload one File to product-images/products/{productId}/, returning the
// public URL and storage path. Sharp converts to WebP at the spec'd 1600px
// max width. Filename is timestamp + random to avoid collisions.
async function uploadProductImage(
  productId: string,
  file: File,
  position: number,
) {
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
      .rotate() // honor EXIF orientation
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    // sharp can't decode this format (e.g. HEIC from an iPhone when the
    // browser couldn't convert it client-side).
    throw new Error(
      `Formati i imazhit "${file.name}" nuk mbështetet. Përdorni JPG, PNG ose WebP.`,
    );
  }

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
  const storagePath = `products/${productId}/${filename}`;

  const admin = createAdminClient();
  const { error: uploadError } = await admin.storage
    .from(PRODUCT_BUCKET)
    .upload(storagePath, webp, {
      contentType: "image/webp",
      cacheControl: "31536000",
      upsert: false,
    });
  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = admin.storage.from(PRODUCT_BUCKET).getPublicUrl(storagePath);

  return { storagePath, publicUrl, position };
}

export async function createProduct(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  try {
    await assertAdmin();
  } catch {
    return { error: SESSION_EXPIRED };
  }

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return {
      error: "Disa fusha janë të pavlefshme.",
      fieldErrors: Object.fromEntries(
        parsed.error.issues.map((i) => [i.path.join("."), i.message]),
      ),
    };
  }

  const admin = createAdminClient();
  const slug = await uniqueSlug(admin, "products", parsed.data.slug);
  const { data: inserted, error: insertError } = await admin
    .from("products")
    .insert({ ...parsed.data, slug })
    .select("id")
    .single();
  if (insertError) {
    return { error: insertError.message };
  }

  // Image upload — multipart "images" field can have N files. If anything in
  // this phase fails, roll the product row back so the admin can simply
  // retry instead of being left with an invisible image-less duplicate.
  const files = formData.getAll("images") as File[];
  const real = files.filter((f) => f && f.size > 0);
  if (real.length) {
    const settled = await Promise.allSettled(
      real.map((f, i) => uploadProductImage(inserted.id, f, i)),
    );
    const uploaded = settled
      .filter((s) => s.status === "fulfilled")
      .map((s) => s.value);
    const rollback = async () => {
      if (uploaded.length) {
        await admin.storage
          .from(PRODUCT_BUCKET)
          .remove(uploaded.map((u) => u.storagePath));
      }
      await admin.from("products").delete().eq("id", inserted.id);
    };

    const failed = settled.find((s) => s.status === "rejected");
    if (failed) {
      await rollback();
      return {
        error: `Ngarkimi i imazheve dështoi: ${errorMessage(failed.reason)}`,
      };
    }

    const { error: imgError } = await admin.from("product_images").insert(
      uploaded.map((u) => ({
        product_id: inserted.id,
        storage_path: u.storagePath,
        image_url: u.publicUrl,
        position: u.position,
      })),
    );
    if (imgError) {
      await rollback();
      return { error: `Ruajtja e imazheve dështoi: ${imgError.message}` };
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  redirect(`/admin/products/${inserted.id}`);
}

export async function updateProduct(
  id: string,
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  try {
    await assertAdmin();
  } catch {
    return { error: SESSION_EXPIRED };
  }

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return {
      error: "Disa fusha janë të pavlefshme.",
      fieldErrors: Object.fromEntries(
        parsed.error.issues.map((i) => [i.path.join("."), i.message]),
      ),
    };
  }

  const admin = createAdminClient();
  const slug = await uniqueSlug(admin, "products", parsed.data.slug, id);
  const { error: updateError } = await admin
    .from("products")
    .update({ ...parsed.data, slug })
    .eq("id", id);
  if (updateError) return { error: updateError.message };

  // Append any newly uploaded images at the end of the gallery.
  const files = formData.getAll("images") as File[];
  const real = files.filter((f) => f && f.size > 0);
  if (real.length) {
    const { count } = await admin
      .from("product_images")
      .select("*", { count: "exact", head: true })
      .eq("product_id", id);
    const start = count ?? 0;
    const settled = await Promise.allSettled(
      real.map((f, i) => uploadProductImage(id, f, start + i)),
    );
    const uploaded = settled
      .filter((s) => s.status === "fulfilled")
      .map((s) => s.value);
    const removeUploaded = async () => {
      if (uploaded.length) {
        await admin.storage
          .from(PRODUCT_BUCKET)
          .remove(uploaded.map((u) => u.storagePath));
      }
    };

    const failed = settled.find((s) => s.status === "rejected");
    if (failed) {
      await removeUploaded();
      return {
        error: `Të dhënat u ruajtën, por ngarkimi i imazheve dështoi: ${errorMessage(failed.reason)}`,
      };
    }

    const { error: imgError } = await admin.from("product_images").insert(
      uploaded.map((u) => ({
        product_id: id,
        storage_path: u.storagePath,
        image_url: u.publicUrl,
        position: u.position,
      })),
    );
    if (imgError) {
      await removeUploaded();
      return {
        error: `Të dhënat u ruajtën, por ruajtja e imazheve dështoi: ${imgError.message}`,
      };
    }
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidatePath(`/product/${slug}`);
  revalidatePath("/shop");
  revalidatePath("/");
  return { success: "Ndryshimet u ruajtën." };
}

export async function deleteProduct(
  id: string,
): Promise<{ error?: string } | void> {
  await assertAdmin();
  const admin = createAdminClient();

  // Pull storage paths before the row (and its product_images, via cascade)
  // disappear — but don't delete the files until the row delete succeeds.
  const { data: imgs } = await admin
    .from("product_images")
    .select("storage_path")
    .eq("product_id", id);

  // Remove the product from any active carts first: cart_items.product_id is
  // a restrict FK, so it would otherwise block the delete. order_items keeps
  // its snapshot (FK is ON DELETE SET NULL per migration 0004), so order
  // history is preserved.
  await admin.from("cart_items").delete().eq("product_id", id);

  const { error } = await admin.from("products").delete().eq("id", id);
  if (error) {
    return { error: `Produkti nuk u fshi: ${error.message}` };
  }

  if (imgs?.length) {
    await admin.storage
      .from(PRODUCT_BUCKET)
      .remove(imgs.map((i) => i.storage_path));
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  redirect("/admin/products");
}

export async function deleteProductImage(id: string, productId: string) {
  await assertAdmin();
  const admin = createAdminClient();

  const { data: img } = await admin
    .from("product_images")
    .select("storage_path")
    .eq("id", id)
    .single();
  if (img) {
    await admin.storage.from(PRODUCT_BUCKET).remove([img.storage_path]);
  }
  await admin.from("product_images").delete().eq("id", id);

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/");
}
