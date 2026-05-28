"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage,
  type ProductFormState,
} from "@/app/admin/products/actions";
import { slugify } from "@/lib/slug";

type Category = { id: string; name: string };
type ExistingImage = { id: string; image_url: string; position: number };

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  discount_price: number | null;
  sku: string | null;
  stock: number;
  featured: boolean;
  category_id: string | null;
};

export function ProductForm({
  mode,
  categories,
  product,
  images,
}: {
  mode: "create" | "edit";
  categories: Category[];
  product?: Product;
  images?: ExistingImage[];
}) {
  const boundAction =
    mode === "create" ? createProduct : updateProduct.bind(null, product!.id);
  const [state, action, pending] = useActionState<ProductFormState, FormData>(
    boundAction,
    undefined,
  );

  // Auto-fill the slug from the name only while it hasn't been hand-edited.
  // A non-empty initial slug (edit mode) counts as hand-edited so we don't
  // overwrite the live product URL when the user touches the name field.
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product?.slug));

  const fieldErr = (k: string) => state?.fieldErrors?.[k];

  return (
    <form action={action} className="r-split r-split--2" style={{ gap: 24 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Field label="Emri" error={fieldErr("name")}>
          <Input
            name="name"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
          />
        </Field>

        <Field label="Slug" error={fieldErr("slug")} hint={`/shop/${slug || "..."}`}>
          <Input
            name="slug"
            required
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
          />
        </Field>

        <Field label="Përshkrimi">
          <textarea
            name="description"
            defaultValue={product?.description ?? ""}
            rows={6}
            style={inputStyle}
          />
        </Field>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 16,
          }}
        >
          <Field label="Çmimi (€)" error={fieldErr("price")}>
            <Input
              name="price"
              type="number"
              min={0}
              step="0.01"
              required
              defaultValue={product?.price ?? ""}
            />
          </Field>
          <Field label="Çmimi i uljes (€)" error={fieldErr("discount_price")}>
            <Input
              name="discount_price"
              type="number"
              min={0}
              step="0.01"
              defaultValue={product?.discount_price ?? ""}
            />
          </Field>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 16,
          }}
        >
          <Field label="SKU">
            <Input name="sku" defaultValue={product?.sku ?? ""} />
          </Field>
          <Field label="Stoku" error={fieldErr("stock")}>
            <Input
              name="stock"
              type="number"
              min={0}
              required
              defaultValue={product?.stock ?? 0}
            />
          </Field>
        </div>

        <Field label="Kategoria">
          <select
            name="category_id"
            defaultValue={product?.category_id ?? ""}
            style={inputStyle}
          >
            <option value="">— Pa kategori —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 13,
            color: "var(--text)",
          }}
        >
          <input
            type="checkbox"
            name="featured"
            defaultChecked={product?.featured ?? false}
          />
          Shfaq në kryefaqe
        </label>

        {state?.error && (
          <div style={{ color: "var(--sale)", fontSize: 13 }}>{state.error}</div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button type="submit" className="btn btn--solid" disabled={pending}>
            {pending
              ? "Duke ruajtur…"
              : mode === "create"
                ? "Krijo produktin"
                : "Ruaj ndryshimet"}
          </button>
          {mode === "edit" && product && <DeleteButton productId={product.id} />}
        </div>
      </div>

      <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="eyebrow">Imazhet</div>

        {mode === "edit" && images && images.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 8,
            }}
          >
            {[...images]
              .sort((a, b) => a.position - b.position)
              .map((img) => (
                <ImageThumb
                  key={img.id}
                  img={img}
                  productId={product!.id}
                />
              ))}
          </div>
        )}

        <Field label="Ngarko imazhe të reja" hint="WEBP, max 1600px • shumë skedarë">
          <input
            type="file"
            name="images"
            accept="image/*"
            multiple
            style={{
              padding: 8,
              background: "var(--bg)",
              border: "1px dashed var(--border)",
              color: "var(--text-2)",
              fontSize: 12,
            }}
          />
        </Field>
      </aside>
    </form>
  );
}

function ImageThumb({
  img,
  productId,
}: {
  img: ExistingImage;
  productId: string;
}) {
  async function remove() {
    if (!confirm("Të fshihet ky imazh?")) return;
    await deleteProductImage(img.id, productId);
  }
  return (
    <div
      style={{
        position: "relative",
        aspectRatio: "1 / 1",
        background: "var(--bg)",
        overflow: "hidden",
      }}
    >
      <Image
        src={img.image_url}
        alt=""
        fill
        sizes="120px"
        style={{ objectFit: "cover" }}
      />
      <button
        type="button"
        onClick={remove}
        style={{
          position: "absolute",
          top: 4,
          right: 4,
          width: 24,
          height: 24,
          background: "rgba(15,13,11,0.85)",
          border: "1px solid var(--border)",
          color: "var(--text)",
          cursor: "pointer",
          fontSize: 14,
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  );
}

function DeleteButton({ productId }: { productId: string }) {
  async function onDelete() {
    if (!confirm("Të fshihet ky produkt? Veprimi është i pakthyeshëm.")) return;
    await deleteProduct(productId);
  }
  return (
    <button
      type="button"
      onClick={onDelete}
      className="btn"
      style={{
        borderColor: "var(--sale)",
        color: "var(--sale)",
        marginLeft: "auto",
      }}
    >
      Fshi produktin
    </button>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span
        style={{
          fontSize: 11,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--muted)",
        }}
      >
        {label}
      </span>
      {children}
      {hint && !error && (
        <span style={{ fontSize: 12, color: "var(--muted)" }}>{hint}</span>
      )}
      {error && (
        <span style={{ fontSize: 12, color: "var(--sale)" }}>{error}</span>
      )}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ ...inputStyle, ...(props.style ?? {}) }} />;
}

const inputStyle: React.CSSProperties = {
  padding: "11px 12px",
  background: "var(--bg)",
  border: "1px solid var(--border)",
  color: "var(--text)",
  fontFamily: "var(--font-outfit), system-ui, sans-serif",
  fontSize: 14,
  outline: "none",
};
