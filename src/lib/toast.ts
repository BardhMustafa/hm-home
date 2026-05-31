export type ToastType = "success" | "error" | "info";

export interface ToastPayload {
  id: string;
  message: string;
  type: ToastType;
}

export function toast(message: string, type: ToastType = "success") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<ToastPayload>("hm:toast", {
      detail: { id: `${Date.now()}-${Math.random()}`, message, type },
    }),
  );
}
