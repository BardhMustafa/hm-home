"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  type CategoryFormState,
} from "@/app/admin/categories/actions";
import { slugify } from "@/lib/slug";

type Category = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
};

export function CategoryForm({
  mode,
  category,
}: {
  mode: "create" | "edit";
  category?: Category;
}) {
  const boundAction =
    mode === "create" ? createCategory : updateCategory.bind(null, category!.id);
  const [state, action, pending] = useActionState<CategoryFormState, FormData>(
    boundAction,
    undefined,
  );

  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(category?.slug));

  const fieldErr = (k: string) => state?.fieldErrors?.[k];

  return (
    <form
      action={action}
      className="r-split r-split--2"
      style={{ gap: 24, maxWidth: 880 }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Field label="Emri" error={fieldErr("name")}>
          <input
            name="name"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            style={inputStyle}
          />
        </Field>

        <Field label="Slug" error={fieldErr("slug")}>
          <input
            name="slug"
            required
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
            style={inputStyle}
          />
        </Field>

        {state?.error && (
          <div style={{ color: "var(--sale)", fontSize: 13 }}>{state.error}</div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button type="submit" className="btn btn--solid" disabled={pending}>
            {pending
              ? "Duke ruajtur…"
              : mode === "create"
                ? "Krijo kategorinë"
                : "Ruaj"}
          </button>
          {mode === "edit" && category && (
            <DeleteButton categoryId={category.id} />
          )}
        </div>
      </div>

      <aside style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div className="eyebrow">Imazhi</div>
        {category?.image_url && (
          <div
            style={{
              position: "relative",
              aspectRatio: "4 / 5",
              background: "var(--bg)",
              overflow: "hidden",
            }}
          >
            <Image
              src={category.image_url}
              alt={category.name}
              fill
              sizes="240px"
              style={{ objectFit: "cover" }}
            />
          </div>
        )}
        <input
          type="file"
          name="image"
          accept="image/*"
          style={{
            padding: 8,
            background: "var(--bg)",
            border: "1px dashed var(--border)",
            color: "var(--text-2)",
            fontSize: 12,
          }}
        />
      </aside>
    </form>
  );
}

function DeleteButton({ categoryId }: { categoryId: string }) {
  async function onDelete() {
    if (!confirm("Të fshihet kjo kategori?")) return;
    await deleteCategory(categoryId);
  }
  return (
    <button
      type="button"
      onClick={onDelete}
      className="btn"
      style={{ borderColor: "var(--sale)", color: "var(--sale)" }}
    >
      Fshi
    </button>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
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
      {error && (
        <span style={{ fontSize: 12, color: "var(--sale)" }}>{error}</span>
      )}
    </label>
  );
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
