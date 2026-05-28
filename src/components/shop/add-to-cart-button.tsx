"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCartAction } from "@/app/cart/actions";

export function AddToCartButton({
  productId,
  disabled,
}: {
  productId: string;
  disabled?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);
  const router = useRouter();

  function onClick() {
    startTransition(async () => {
      await addToCartAction(productId, 1);
      setAdded(true);
      router.refresh();
      setTimeout(() => setAdded(false), 1800);
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || pending}
      className="btn btn--solid"
      style={{ flex: 1, justifyContent: "center" }}
    >
      {pending ? "Duke shtuar…" : added ? "U shtua ✓" : "Shto në shportë"}
    </button>
  );
}
