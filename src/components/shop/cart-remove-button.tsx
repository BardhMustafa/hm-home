"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeCartItemAction } from "@/app/cart/actions";

export function CartRemoveButton({ itemId }: { itemId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() =>
        startTransition(async () => {
          await removeCartItemAction(itemId);
          // Force the cart route to refetch so the transition resolves and the
          // spinner clears — revalidatePath alone doesn't refresh the open page.
          router.refresh();
        })
      }
      disabled={pending}
      style={{
        fontSize: 26,
        color: "var(--muted)",
        background: "transparent",
        border: 0,
        cursor: pending ? "wait" : "pointer",
        lineHeight: 1,
        padding: 0,
        display: "grid",
        placeItems: "center",
        width: 28,
        height: 28,
        opacity: pending ? 0.4 : 1,
        transition: "opacity 0.15s",
      }}
      aria-label="Hiqe nga shporta"
    >
      {pending ? <Spinner /> : "×"}
    </button>
  );
}

function Spinner() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      style={{ animation: "spin 0.7s linear infinite" }}
    >
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}
