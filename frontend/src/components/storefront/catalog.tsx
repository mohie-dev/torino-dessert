"use client";

import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/storefront/product-card";
import {
  fetchCategories,
  fetchStorefrontProducts,
} from "@/lib/store-api";

export function Catalog() {
  const [categoryId, setCategoryId] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const categoriesQuery = useQuery({
    queryKey: ["storefront", "categories"],
    queryFn: fetchCategories,
  });
  const productsQuery = useQuery({
    queryKey: ["storefront", "products", categoryId, search],
    queryFn: () =>
      fetchStorefrontProducts({
        categoryId: categoryId || undefined,
        search: search || undefined,
      }),
  });

  const products = useMemo(
    () => productsQuery.data?.data ?? [],
    [productsQuery.data],
  );

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearch(searchInput.trim());
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20" id="shop">
      <div className="mb-6 flex flex-col justify-between gap-5 sm:mb-8 sm:flex-row sm:items-end sm:gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-chocolate-light">
            Baked for your moments
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-5xl">
            The dessert counter
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-muted">
            Small-batch favorites made fresh, ready to make an ordinary day feel special.
          </p>
        </div>
        <form className="flex w-full gap-2 sm:max-w-sm" onSubmit={submitSearch} role="search">
          <label className="relative flex-1">
            <span className="sr-only">Search desserts</span>
            <Search aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input
              className="h-12 w-full rounded-2xl border border-cream-dark bg-white pl-11 pr-4 text-sm text-ink placeholder:text-muted/80"
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Find your favorite…"
              type="search"
              value={searchInput}
            />
          </label>
          <button
            aria-label="Search products"
            className="grid size-12 place-items-center rounded-2xl bg-chocolate text-white transition hover:bg-chocolate-dark"
            type="submit"
          >
            <SlidersHorizontal size={18} />
          </button>
        </form>
      </div>

      <div aria-label="Filter products by category" className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:mb-8 sm:px-0">
        <button
          aria-pressed={!categoryId}
          className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition sm:px-5 ${
            !categoryId ? "bg-chocolate text-white" : "bg-cream text-chocolate hover:bg-cream-dark"
          }`}
          onClick={() => setCategoryId("")}
          type="button"
        >
          Everything
        </button>
        {categoriesQuery.data?.filter((category) => category.isActive).map((category) => (
          <button
            aria-pressed={categoryId === category.id}
            className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition sm:px-5 ${
              categoryId === category.id
                ? "bg-chocolate text-white"
                : "bg-cream text-chocolate hover:bg-cream-dark"
            }`}
            key={category.id}
            onClick={() => setCategoryId(category.id)}
            type="button"
          >
            {category.name}
          </button>
        ))}
      </div>

      {(categoriesQuery.isError || productsQuery.isError) && (
        <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-900" role="alert">
          <p className="font-semibold">We couldn’t load the dessert counter.</p>
          <p className="mt-1">Please check your connection and try again.</p>
          <button
            className="mt-3 font-semibold underline underline-offset-4"
            onClick={() => {
              void categoriesQuery.refetch();
              void productsQuery.refetch();
            }}
            type="button"
          >
            Try again
          </button>
        </div>
      )}

      {productsQuery.isLoading ? (
        <div aria-label="Loading products" className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div className="aspect-[4/5] animate-pulse rounded-3xl bg-cream" key={index} />
          ))}
        </div>
      ) : products.length ? (
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : !productsQuery.isError ? (
        <div className="rounded-3xl bg-cream/70 px-6 py-16 text-center">
          <p className="font-display text-2xl font-semibold text-chocolate">Nothing in the case just yet</p>
          <p className="mt-2 text-sm text-muted">Try another category or search term.</p>
        </div>
      ) : null}
    </section>
  );
}
