"use client";

import { useEffect } from "react";
import { useUIStore, type ToastKind } from "@/stores/ui-store";

const styles: Record<ToastKind, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-red-200 bg-red-50 text-red-900",
  info: "border-cream-dark bg-surface text-ink",
};

export function ToastViewport() {
  const toasts = useUIStore((state) => state.toasts);
  const dismissToast = useUIStore((state) => state.dismissToast);

  useEffect(() => {
    const timers = toasts.map((toast) =>
      window.setTimeout(() => dismissToast(toast.id), 5000),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [toasts, dismissToast]);

  return (
    <div
      aria-live="polite"
      className="fixed right-4 top-20 z-[60] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3"
    >
      {toasts.map((toast) => (
        <div
          className={`flex items-start justify-between gap-4 rounded-2xl border px-4 py-3 text-sm shadow-card ${styles[toast.kind]}`}
          key={toast.id}
          role={toast.kind === "error" ? "alert" : "status"}
        >
          <span>{toast.message}</span>
          <button
            aria-label="Dismiss notification"
            className="font-semibold opacity-70 hover:opacity-100"
            onClick={() => dismissToast(toast.id)}
            type="button"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
