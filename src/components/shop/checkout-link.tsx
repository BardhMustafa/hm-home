"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function CheckoutLink({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function go() {
    startTransition(() => {
      router.push("/checkout");
    });
  }

  return (
    <button
      onClick={go}
      disabled={pending}
      className={className}
      style={{
        width: "100%",
        justifyContent: "center",
        cursor: pending ? "default" : "pointer",
        opacity: pending ? 0.75 : 1,
        ...style,
      }}
    >
      {pending ? (
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ animation: "spin 0.8s linear infinite", flexShrink: 0 }}
          >
            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
          Duke hapur…
        </span>
      ) : (
        "Vazhdo me blerjen"
      )}
    </button>
  );
}
