import Link from "next/link";
import { Check } from "lucide-react";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderNumber?: string }>;
}) {
  const { orderNumber } = await searchParams;

  return (
    <section className="mx-auto flex min-h-[65vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-800">
        <Check size={30} />
      </span>
      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-chocolate-light">
        Order received
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-chocolate sm:text-5xl">
        Something lovely is on its way.
      </h1>
      <p className="mt-4 max-w-md text-sm leading-6 text-muted">
        Thank you for choosing Torino Dessert. We’ve received your order and
        will prepare it with care.
      </p>
      {orderNumber && (
        <p className="mt-5 rounded-full bg-cream px-5 py-2 text-sm font-semibold text-chocolate">
          Order {orderNumber}
        </p>
      )}
      <Link
        className="mt-8 rounded-full bg-velvet px-6 py-3 text-sm font-semibold text-white hover:bg-velvet-dark"
        href="/"
      >
        Back to the shop
      </Link>
    </section>
  );
}
