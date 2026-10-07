"use client";

import Link from "next/link";
import { Check, Plus } from "lucide-react";
import { useState } from "react";
import { getProductImageUrl, type Product } from "@/lib/store-api";
import { formatCurrency } from "@/lib/format";
import { useCartStore } from "@/stores/cart-store";
import { useUIStore } from "@/stores/ui-store";

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const notify = useUIStore((state) => state.notify);
  const [added, setAdded] = useState(false);
  const imageUrl = getProductImageUrl(product);

  function handleAdd() {
    addItem({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      imageUrl,
    });
    setAdded(true);
    notify("success", `${product.name} added to your bag.`);
    window.setTimeout(() => setAdded(false), 1400);
  }

  return (
    <article className="group overflow-hidden rounded-3xl border border-cream-dark/70 bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-elevated">
      <Link
        aria-label={`View details for ${product.name}`}
        className="relative block aspect-[4/3] overflow-hidden bg-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-velvet"
        href={`/products/${product.id}`}
      >
        {imageUrl ? (
          <img
            alt={product.images?.[0]?.altText || product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            decoding="async"
            loading="lazy"
            referrerPolicy="no-referrer"
            src={imageUrl}
          />
        ) : (
          <div className="grid h-full place-items-center bg-gradient-to-br from-cream to-[#ebcdb3]">
            <span aria-hidden="true" className="font-display text-7xl text-chocolate/35">T</span>
          </div>
        )}
        {product.category?.name && (
          <span className="absolute left-4 top-4 rounded-full bg-surface/90 px-3 py-1.5 text-xs font-medium text-chocolate shadow-sm backdrop-blur">
            {product.category.name}
          </span>
        )}
        {product.tags && product.tags.length > 0 && (
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
            {product.tags.slice(0, 2).map((tag) => (
              <span
                className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-ink shadow-sm backdrop-blur"
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
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-current"
                />
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </Link>

      <div className="p-5">
        <div className="flex min-h-[58px] items-start justify-between gap-3">
          <div>
            <Link
              className="font-display text-xl font-semibold leading-tight text-ink hover:text-chocolate focus:outline-none focus-visible:underline"
              href={`/products/${product.id}`}
            >
              {product.name}
            </Link>
            {product.description && (
              <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted">
                {product.description}
              </p>
            )}
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between">
          <p className="font-semibold text-chocolate">{formatCurrency(product.price)}</p>
          <div className="flex items-center gap-2">
            <Link
              className="hidden rounded-full px-2.5 py-2 text-xs font-semibold text-chocolate hover:bg-cream sm:inline-flex"
              href={`/products/${product.id}`}
            >
              Details
            </Link>
            <button
              aria-label={`Add ${product.name} to bag`}
              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-velvet px-4 text-sm font-semibold text-white transition hover:bg-velvet-dark focus:outline-none focus:ring-2 focus:ring-velvet focus:ring-offset-2"
              onClick={handleAdd}
              type="button"
            >
              {added ? <Check size={16} /> : <Plus size={16} />}
              {added ? "Added" : "Add"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
