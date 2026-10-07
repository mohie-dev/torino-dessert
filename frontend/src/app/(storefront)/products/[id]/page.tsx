"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Plus,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { ApiRequestError } from "@/lib/api";
import { useCartStore } from "@/stores/cart-store";
import { useUIStore } from "@/stores/ui-store";
import { fetchStorefrontProduct } from "@/lib/store-api";
import { formatCurrency } from "@/lib/format";

export default function ProductDetailsPage() {
  const params = useParams<{ id: string }>();
  const productId = params.id;
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const notify = useUIStore((state) => state.notify);
  const productQuery = useQuery({
    queryKey: ["storefront", "product", productId],
    queryFn: () => fetchStorefrontProduct(productId),
    enabled: Boolean(productId),
  });

  useEffect(() => {
    setActiveImageIndex(0);
    setQuantity(1);
    setAdded(false);
  }, [productId]);

  const product = productQuery.data;
  const productNotFound =
    productQuery.error instanceof ApiRequestError &&
    productQuery.error.status === 404;
  const images = product?.images?.length
    ? product.images
    : product?.imageUrl
      ? [{ url: product.imageUrl, altText: product.name, sortOrder: 0 }]
      : [];
  const activeImage = images[activeImageIndex] ?? images[0];

  function changeImage(direction: -1 | 1) {
    setActiveImageIndex((index) =>
      (index + direction + images.length) % images.length,
    );
  }

  function handleAddToBag() {
    if (!product) return;
    addItem(
      {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        imageUrl: activeImage?.url ?? null,
      },
      quantity,
    );
    setAdded(true);
    notify(
      "success",
      `${quantity} × ${product.name} added to your bag.`,
    );
    window.setTimeout(() => setAdded(false), 1500);
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <Link
        className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-chocolate transition hover:bg-cream"
        href="/#shop"
      >
        <ArrowLeft size={16} />
        Back to desserts
      </Link>

      {productQuery.isLoading ? (
        <div className="mt-7 grid animate-pulse gap-8 lg:grid-cols-2">
          <div className="aspect-square rounded-3xl bg-cream" />
          <div className="space-y-5 py-4">
            <div className="h-5 w-28 rounded bg-cream" />
            <div className="h-10 w-3/4 rounded bg-cream" />
            <div className="h-24 rounded bg-cream" />
            <div className="h-12 w-1/2 rounded bg-cream" />
          </div>
        </div>
      ) : productQuery.isError || !product ? (
        <div className="mx-auto mt-12 max-w-lg rounded-3xl border border-cream-dark bg-white p-8 text-center shadow-card">
          <h1 className="font-display text-2xl font-semibold text-ink">
            {productNotFound
              ? "This dessert isn’t available right now"
              : "We couldn’t load this dessert"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            {productNotFound
              ? "It may have sold out or been removed from the menu. Browse the dessert counter to find another favorite."
              : "Please check your connection and try again. Your menu is still available."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {productNotFound ? (
              <Link
                className="inline-flex rounded-full bg-velvet px-5 py-3 text-sm font-semibold text-white hover:bg-velvet-dark"
                href="/#shop"
              >
                Browse desserts
              </Link>
            ) : (
              <button
                className="inline-flex rounded-full bg-velvet px-5 py-3 text-sm font-semibold text-white hover:bg-velvet-dark"
                onClick={() => void productQuery.refetch()}
                type="button"
              >
                Try again
              </button>
            )}
            <Link
              className="inline-flex rounded-full border border-cream-dark px-5 py-3 text-sm font-semibold text-chocolate hover:bg-cream"
              href="/#shop"
            >
              Back to menu
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start lg:gap-14">
          <div>
            <div className="group relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-cream to-[#ebcdb3] shadow-card">
              {activeImage ? (
                <img
                  alt={activeImage.altText || product.name}
                  className="h-full w-full object-cover"
                  fetchPriority="high"
                  referrerPolicy="no-referrer"
                  src={activeImage.url}
                />
              ) : (
                <div className="grid h-full place-items-center font-display text-8xl text-chocolate/30">
                  T
                </div>
              )}
              {images.length > 1 && (
                <>
                  <button
                    aria-label="Previous product image"
                    className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-chocolate shadow transition hover:bg-white"
                    onClick={() => changeImage(-1)}
                    type="button"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    aria-label="Next product image"
                    className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-chocolate shadow transition hover:bg-white"
                    onClick={() => changeImage(1)}
                    type="button"
                  >
                    <ChevronRight size={20} />
                  </button>
                  <span className="absolute bottom-3 right-3 rounded-full bg-ink/70 px-3 py-1.5 text-xs font-medium text-white">
                    {activeImageIndex + 1} / {images.length}
                  </span>
                </>
              )}
              {product.category?.name && (
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3.5 py-2 text-xs font-semibold text-chocolate shadow-sm backdrop-blur">
                  {product.category.name}
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div
                aria-label="Product images"
                className="mt-3 flex gap-3 overflow-x-auto pb-2"
              >
                {images.map((image, index) => (
                  <button
                    aria-label={`Show image ${index + 1}`}
                    aria-pressed={activeImageIndex === index}
                    className={`size-16 shrink-0 overflow-hidden rounded-xl border-2 transition sm:size-20 ${
                      activeImageIndex === index
                        ? "border-velvet"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                    key={`${image.url}-${index}`}
                    onClick={() => setActiveImageIndex(index)}
                    type="button"
                  >
                    <img
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                      src={image.url}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-28">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-chocolate-light">
              Fresh from Torino
            </p>
            <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl lg:text-5xl">
              {product.name}
            </h1>
            <p className="mt-5 text-2xl font-semibold text-chocolate">
              {formatCurrency(product.price)}
            </p>

            {product.tags && product.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full bg-cream px-3 py-1.5 text-xs font-semibold text-chocolate"
                    key={tag.id}
                    style={
                      tag.colorHex
                        ? {
                            backgroundColor: `color-mix(in srgb, ${tag.colorHex} 14%, white)`,
                            color: tag.colorHex,
                          }
                        : undefined
                    }
                  >
                    <Sparkles size={13} />
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            {product.description && (
              <div className="mt-7 border-t border-cream-dark pt-6">
                <h2 className="text-sm font-semibold text-ink">
                  About this dessert
                </h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-muted">
                  {product.description}
                </p>
              </div>
            )}

            {product.portionSize && (
              <div className="mt-5 flex items-start gap-3 rounded-2xl bg-cream/70 p-4">
                <ShoppingBag className="mt-0.5 shrink-0 text-chocolate" size={18} />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-chocolate-light">
                    Portion / size
                  </p>
                  <p className="mt-1 text-sm font-medium text-ink">
                    {product.portionSize}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 border-t border-cream-dark pt-6 sm:flex-row">
              <div className="flex h-12 items-center justify-between rounded-full border border-cream-dark bg-white px-2 sm:w-36">
                <button
                  aria-label="Decrease quantity"
                  className="grid size-9 place-items-center rounded-full text-chocolate hover:bg-cream disabled:opacity-40"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  type="button"
                >
                  <span aria-hidden="true" className="text-lg">−</span>
                </button>
                <span aria-live="polite" className="min-w-6 text-center text-sm font-semibold">
                  {quantity}
                </span>
                <button
                  aria-label="Increase quantity"
                  className="grid size-9 place-items-center rounded-full text-chocolate hover:bg-cream"
                  onClick={() => setQuantity((value) => Math.min(20, value + 1))}
                  type="button"
                >
                  <Plus size={16} />
                </button>
              </div>
              <button
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-velvet px-6 text-sm font-semibold text-white transition hover:bg-velvet-dark focus:outline-none focus:ring-2 focus:ring-velvet focus:ring-offset-2"
                onClick={handleAddToBag}
                type="button"
              >
                {added ? <Check size={18} /> : <ShoppingBag size={18} />}
                {added ? "Added to your bag" : "Add to bag"}
              </button>
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-muted">
              <Clock3 size={14} />
              Freshly prepared for your order.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
