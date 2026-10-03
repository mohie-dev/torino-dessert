"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

type ConfirmationDialogProps = {
  title: string;
  message: string;
  confirmLabel: string;
  isPending?: boolean;
  destructive?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmationDialog({
  title,
  message,
  confirmLabel,
  isPending = false,
  destructive = true,
  onCancel,
  onConfirm,
}: ConfirmationDialogProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isPending) onCancel();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPending, onCancel]);

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-ink/55 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isPending) onCancel();
      }}
    >
      <section
        aria-labelledby="confirmation-dialog-title"
        aria-modal="true"
        className="w-full max-w-md rounded-3xl border border-cream-dark/70 bg-surface p-6 shadow-elevated sm:p-7"
        role="alertdialog"
      >
        <span
          className={`grid size-12 place-items-center rounded-2xl ${
            destructive ? "bg-velvet/10 text-velvet" : "bg-cream text-chocolate"
          }`}
        >
          <AlertTriangle aria-hidden="true" size={22} />
        </span>
        <h2
          className="mt-5 font-display text-2xl font-semibold text-ink"
          id="confirmation-dialog-title"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">{message}</p>
        <div className="mt-7 flex justify-end gap-3">
          <button
            className="rounded-full border border-cream-dark px-5 py-2.5 text-sm font-semibold text-chocolate transition hover:bg-cream disabled:opacity-50"
            disabled={isPending}
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className={`rounded-full px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-wait disabled:opacity-60 ${
              destructive
                ? "bg-velvet hover:bg-velvet-dark"
                : "bg-chocolate hover:bg-chocolate-dark"
            }`}
            disabled={isPending}
            onClick={onConfirm}
            type="button"
          >
            {isPending ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
