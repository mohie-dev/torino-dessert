"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Minus, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { FieldErrors } from "react-hook-form";
import { fetchStoreSettings, submitOrder } from "@/lib/store-api";
import { formatCurrency } from "@/lib/format";
import {
  checkoutFormSchema,
  createOrderSchema,
  type CheckoutFormInput,
  type CheckoutFormValues,
} from "@/schemas/api-schemas";
import { getCartSubtotal, useCartStore } from "@/stores/cart-store";
import { useUIStore } from "@/stores/ui-store";

const fieldClass =
  "mt-2 w-full rounded-2xl border border-cream-dark bg-white px-4 py-3 text-sm text-ink placeholder:text-muted/70 focus:border-chocolate";

export function CheckoutForm() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const notify = useUIStore((state) => state.notify);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const settingsQuery = useQuery({
    queryKey: ["storefront", "settings"],
    queryFn: fetchStoreSettings,
    staleTime: 15_000,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormInput, unknown, CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      customer: { name: "", phone: "", email: "" },
      deliveryAddress: "",
      notes: "",
      paymentMethod: "CASH_ON_DELIVERY",
    },
  });

  const subtotal = getCartSubtotal(items);
  const settings = settingsQuery.data;
  const deliveryFee = Number(settings?.deliveryFee ?? 0);
  const isOpen = settings?.isOpen === true;

  async function onSubmit(values: CheckoutFormValues) {
    setSubmitError(null);

    if (settings?.isOpen === false) {
      setSubmitError("We’re currently closed and cannot accept new orders.");
      return;
    }

    try {
      const payload = createOrderSchema.parse({
        ...values,
        items: items.map(({ product, quantity }) => ({
          productId: product.id,
          quantity,
        })),
      });
      const result = await submitOrder(payload);
      clearCart();
      notify("success", "Your order has been placed.");
      router.push(
        `/checkout/success?orderNumber=${encodeURIComponent(result.orderNumber)}`,
      );
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Your order could not be submitted. Please try again.",
      );
    }
  }

  function onInvalid(errors: FieldErrors<CheckoutFormInput>) {
    const firstError = [
      errors.customer?.name?.message,
      errors.customer?.phone?.message,
      errors.customer?.email?.message,
      errors.deliveryAddress?.message,
      errors.paymentMethod?.message,
    ].find((message): message is string => typeof message === "string");

    setSubmitError(
      firstError ??
        (errors.customer?.email
          ? "The email address is invalid."
          : "Please check the required checkout fields and try again."),
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-3 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-16">
      <Link className="mb-6 inline-flex min-h-10 items-center gap-2 text-sm font-medium text-chocolate hover:text-velvet sm:mb-8" href="/">
        <ArrowLeft size={16} /> Continue shopping
      </Link>

      <div className="mb-7 sm:mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-chocolate-light">Almost yours</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-5xl">Checkout</h1>
      </div>

      {!items.length ? (
        <div className="rounded-4xl bg-cream/70 px-6 py-16 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-full bg-white text-chocolate shadow-card">
            <ShoppingBag size={23} />
          </span>
          <h2 className="mt-5 font-display text-2xl font-semibold text-chocolate">Your bag is waiting for a treat</h2>
          <p className="mt-2 text-sm text-muted">Pick something delicious and it’ll be right here.</p>
          <Link className="mt-6 inline-flex rounded-full bg-velvet px-6 py-3 text-sm font-semibold text-white hover:bg-velvet-dark" href="/#shop">
            Browse desserts
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_390px]">
          <form className="space-y-8" onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
            <section className="rounded-3xl border border-cream-dark/70 bg-surface p-4 shadow-card sm:p-8">
                <h2 className="font-display text-xl font-semibold text-chocolate sm:text-2xl">Delivery details</h2>
                <div className="mt-5 grid gap-4 sm:mt-6 sm:grid-cols-2 sm:gap-5">
                <div>
                  <label className="text-sm font-medium text-ink" htmlFor="customer.name">Full name</label>
                  <input className={fieldClass} id="customer.name" {...register("customer.name")} autoComplete="name" />
                  {errors.customer?.name && <p className="mt-1 text-xs text-velvet" role="alert">{errors.customer.name.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-ink" htmlFor="customer.phone">Phone number</label>
                  <input className={fieldClass} id="customer.phone" {...register("customer.phone")} autoComplete="tel" inputMode="tel" />
                  {errors.customer?.phone && <p className="mt-1 text-xs text-velvet" role="alert">{errors.customer.phone.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-ink" htmlFor="customer.email">Email <span className="font-normal text-muted">(optional)</span></label>
                  <input className={fieldClass} id="customer.email" {...register("customer.email")} autoComplete="email" type="email" />
                  {errors.customer?.email && <p className="mt-1 text-xs text-velvet" role="alert">{errors.customer.email.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-ink" htmlFor="deliveryAddress">Delivery address</label>
                  <textarea className={`${fieldClass} min-h-24 resize-y`} id="deliveryAddress" {...register("deliveryAddress")} autoComplete="street-address" />
                  {errors.deliveryAddress && <p className="mt-1 text-xs text-velvet" role="alert">{errors.deliveryAddress.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-ink" htmlFor="notes">Order notes <span className="font-normal text-muted">(optional)</span></label>
                  <textarea className={`${fieldClass} min-h-20 resize-y`} id="notes" {...register("notes")} placeholder="Anything we should know?" />
                </div>
              </div>
              <input type="hidden" {...register("paymentMethod")} value="CASH_ON_DELIVERY" />
            </section>

            {submitError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-900" role="alert">
                {submitError}
              </div>
            )}

            {settingsQuery.isError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-900" role="alert">
                Store hours and delivery fees could not be loaded. The store will verify availability and calculate your final delivery fee when you place the order.
                <button className="ml-2 font-semibold underline" onClick={() => void settingsQuery.refetch()} type="button">Retry</button>
              </div>
            )}

            {!settingsQuery.isLoading && settings && !isOpen && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950" role="status">
                We’re closed at the moment. You can browse the menu, but checkout will be available when we reopen.
              </div>
            )}

            <button
              className="min-h-14 w-full rounded-full bg-velvet px-6 text-base font-semibold text-white shadow-card transition hover:bg-velvet-dark focus:outline-none focus:ring-2 focus:ring-velvet focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={
                isSubmitting ||
                settingsQuery.isLoading ||
                settings?.isOpen === false ||
                items.length === 0
              }
              type="submit"
            >
              {isSubmitting ? "Placing your order…" : "Place order"}
            </button>
          </form>

          <aside className="h-fit rounded-3xl border border-cream-dark/70 bg-cream/60 p-4 sm:p-7 lg:sticky lg:top-28">
            <h2 className="font-display text-xl font-semibold text-chocolate sm:text-2xl">Your order</h2>
            <ul className="mt-5 divide-y divide-chocolate/10">
              {items.map(({ product, quantity }) => (
                <li className="flex items-center justify-between gap-3 py-4" key={product.id}>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{product.name}</p>
                    <p className="mt-1 text-xs text-muted">{formatCurrency(product.price)} each</p>
                    <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white p-1">
                      <button
                        aria-label={`Decrease ${product.name} quantity`}
                        className="grid size-7 place-items-center rounded-full text-chocolate hover:bg-cream"
                        onClick={() => setQuantity(product.id, quantity - 1)}
                        type="button"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="min-w-5 text-center text-xs font-semibold">{quantity}</span>
                      <button
                        aria-label={`Increase ${product.name} quantity`}
                        className="grid size-7 place-items-center rounded-full text-chocolate hover:bg-cream"
                        onClick={() => setQuantity(product.id, quantity + 1)}
                        type="button"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-chocolate">
                    {formatCurrency(Number(product.price) * quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-3 space-y-3 border-t border-chocolate/15 pt-5 text-sm">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Delivery</span>
                <span>
                  {settingsQuery.isLoading
                    ? "Loading…"
                    : settingsQuery.isError
                      ? "Confirmed at checkout"
                      : formatCurrency(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between border-t border-chocolate/15 pt-4 text-base font-semibold text-ink">
                <span>Total</span>
                <span>
                  {settingsQuery.isError
                    ? "Confirmed at checkout"
                    : formatCurrency(subtotal + deliveryFee)}
                </span>
              </div>
              <p className="pt-1 text-xs leading-5 text-muted">
                Final prices, delivery fees, and store availability are confirmed by the store when your order is submitted. Payment is cash on delivery.
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
