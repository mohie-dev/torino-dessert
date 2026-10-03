import { ShieldAlert } from "lucide-react";

export function AccessNotice({ message }: { message: string }) {
  return (
    <div
      className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-950"
      role="status"
    >
      <ShieldAlert className="mb-3 text-amber-800" size={25} />
      {message}
    </div>
  );
}

export function DataError({
  onRetry,
  message,
}: {
  onRetry: () => void;
  message?: string;
}) {
  return (
    <div
      className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-900"
      role="alert"
    >
      <span>{message ?? "We couldn’t load this information."} </span>
      <button
        className="font-semibold underline underline-offset-4"
        onClick={onRetry}
        type="button"
      >
        Try again
      </button>
    </div>
  );
}
