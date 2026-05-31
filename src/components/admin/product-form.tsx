"use client";

import { useActionState, useRef, useState } from "react";
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
  stock: number | null;
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

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product?.slug));
  const [madeToOrder, setMadeToOrder] = useState(product?.stock === null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fieldErr = (k: string) => state?.fieldErrors?.[k];

  return (
    <>
      {/* Full-screen overlay loader */}
      {pending && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10, 9, 8, 0.88)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
            backdropFilter: "blur(4px)",
          }}
        >
          <div className="admin-spinner" />
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "var(--muted)",
            }}
          >
            {selectedFiles.length > 0 ? "Duke ngarkuar imazhet…" : "Duke ruajtur…"}
          </div>
        </div>
      )}

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

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span
              style={{
                fontSize: 11,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--muted)",
              }}
            >
              Stoku
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                type="button"
                onClick={() => setMadeToOrder((v) => !v)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "9px 14px",
                  fontSize: 12,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  background: madeToOrder ? "var(--gold)" : "var(--surface)",
                  color: madeToOrder ? "var(--bg)" : "var(--muted)",
                  border: "1px solid var(--border)",
                  cursor: "pointer",
                  transition: "background 0.15s, color 0.15s",
                  flexShrink: 0,
                }}
              >
                {madeToOrder ? "Me porosi ✓" : "Me porosi"}
              </button>
              {madeToOrder ? (
                <input type="hidden" name="stock" value="" />
              ) : (
                <Input
                  name="stock"
                  type="number"
                  min={0}
                  placeholder="0"
                  defaultValue={product?.stock ?? ""}
                  style={{ flex: 1 }}
                />
              )}
            </div>
            {fieldErr("stock") && (
              <span style={{ fontSize: 12, color: "var(--sale)" }}>{fieldErr("stock")}</span>
            )}
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
              cursor: "pointer",
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
            <div
              style={{
                padding: "12px 14px",
                background: "rgba(196,106,58,0.1)",
                border: "1px solid var(--sale)",
                color: "var(--sale)",
                fontSize: 13,
              }}
            >
              {state.error}
            </div>
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

        {/* Right column — images */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="eyebrow">Imazhet</div>

          {mode === "edit" && images && images.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 6,
              }}
            >
              {[...images]
                .sort((a, b) => a.position - b.position)
                .map((img) => (
                  <ImageThumb key={img.id} img={img} productId={product!.id} />
                ))}
            </div>
          )}

          {/* Styled file upload zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              padding: "36px 24px",
              border: selectedFiles.length > 0
                ? "2px dashed var(--gold-deep)"
                : "2px dashed var(--border)",
              background: selectedFiles.length > 0
                ? "rgba(194,168,117,0.04)"
                : "var(--bg)",
              cursor: "pointer",
              transition: "border-color 0.2s, background 0.2s",
              textAlign: "center",
              userSelect: "none",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = "var(--gold-deep)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor =
                selectedFiles.length > 0 ? "var(--gold-deep)" : "var(--border)";
            }}
          >
            {/* Upload icon */}
            <svg
              width={32}
              height={32}
              viewBox="0 0 24 24"
              fill="none"
              stroke={selectedFiles.length > 0 ? "var(--gold)" : "var(--muted)"}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1={12} y1={3} x2={12} y2={15} />
            </svg>

            {selectedFiles.length > 0 ? (
              <>
                <div style={{ fontSize: 13, color: "var(--gold)", fontWeight: 500 }}>
                  {selectedFiles.length} skedar{selectedFiles.length > 1 ? "ë" : ""} zgjedhur
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    width: "100%",
                    maxHeight: 120,
                    overflowY: "auto",
                  }}
                >
                  {selectedFiles.map((f, i) => (
                    <div
                      key={i}
                      style={{
                        fontSize: 11,
                        color: "var(--muted)",
                        letterSpacing: "0.04em",
                        padding: "3px 8px",
                        background: "var(--surface)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {f.name}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFiles([]);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--muted)",
                    background: "transparent",
                    border: "1px solid var(--border)",
                    padding: "5px 12px",
                    cursor: "pointer",
                  }}
                >
                  Pastro zgjedhjen
                </button>
              </>
            ) : (
              <>
                <div style={{ fontSize: 13, color: "var(--text-2)" }}>
                  Kliko ose tërhiq imazhet këtu
                </div>
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.1em",
                    color: "var(--muted)",
                    textTransform: "uppercase",
                  }}
                >
                  WEBP · PNG · JPG — max 1600px — shumë skedarë
                </div>
              </>
            )}

            <input
              ref={fileInputRef}
              type="file"
              name="images"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={(e) => setSelectedFiles(Array.from(e.target.files ?? []))}
            />
          </div>
        </aside>
      </form>
    </>
  );
}

function ImageThumb({
  img,
  productId,
}: {
  img: ExistingImage;
  productId: string;
}) {
  const [removing, setRemoving] = useState(false);

  async function remove() {
    if (!confirm("Të fshihet ky imazh?")) return;
    setRemoving(true);
    await deleteProductImage(img.id, productId);
  }

  return (
    <div
      style={{
        position: "relative",
        aspectRatio: "1 / 1",
        background: "var(--bg)",
        overflow: "hidden",
        opacity: removing ? 0.4 : 1,
        transition: "opacity 0.2s",
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
        disabled={removing}
        style={{
          position: "absolute",
          top: 4,
          right: 4,
          width: 22,
          height: 22,
          background: "rgba(15,13,11,0.9)",
          border: "1px solid var(--border)",
          color: "var(--text)",
          cursor: "pointer",
          fontSize: 13,
          lineHeight: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        ×
      </button>
    </div>
  );
}

function DeleteButton({ productId }: { productId: string }) {
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    if (!confirm("Të fshihet ky produkt? Veprimi është i pakthyeshëm.")) return;
    setBusy(true);
    await deleteProduct(productId);
  }

  return (
    <>
      {busy && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10,9,8,0.88)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
            backdropFilter: "blur(4px)",
          }}
        >
          <div className="admin-spinner" />
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "var(--muted)",
            }}
          >
            Duke fshirë…
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={onDelete}
        disabled={busy}
        className="btn"
        style={{
          borderColor: "var(--sale)",
          color: "var(--sale)",
          marginLeft: "auto",
        }}
      >
        Fshi produktin
      </button>
    </>
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
