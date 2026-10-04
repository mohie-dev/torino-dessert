"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { getCartCount, useCartStore } from "@/stores/cart-store";
import { useUIStore } from "@/stores/ui-store";
import { BrandLockup } from "@/components/brand-lockup";

export function Navbar() {
  const items = useCartStore((state) => state.items);
  const isMenuOpen = useUIStore((state) => state.isMobileMenuOpen);
  const setMenuOpen = useUIStore((state) => state.setMobileMenuOpen);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-cream-dark/70 bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:h-[76px] sm:px-6 lg:px-8">
        <Link
          aria-label="Torino Dessert home"
          className="flex origin-left scale-[0.88] items-center sm:scale-100"
          href="/"
          onClick={closeMenu}
        >
          <BrandLockup iconSize="small" />
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-9 md:flex">
          <Link className="text-sm text-ink transition hover:text-chocolate" href="/#shop">
            Shop
          </Link>
          <Link className="text-sm text-ink transition hover:text-chocolate" href="/#story">
            Our story
          </Link>
          <Link
            className="text-sm text-ink transition hover:text-chocolate"
            href="/#contact"
          >
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            aria-label={`Shopping bag, ${hydrated ? getCartCount(items) : 0} items`}
            className="relative grid size-10 place-items-center rounded-full text-chocolate transition hover:bg-cream sm:size-11"
            href="/checkout"
          >
            <ShoppingBag aria-hidden="true" size={21} strokeWidth={1.8} />
            <span className="absolute -right-0.5 -top-0.5 grid size-[19px] place-items-center rounded-full bg-velvet text-[10px] font-semibold text-white">
              {hydrated ? getCartCount(items) : 0}
            </span>
          </Link>
          <button
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            className="grid size-10 place-items-center rounded-full text-chocolate hover:bg-cream md:hidden sm:size-11"
            onClick={() => setMenuOpen(!isMenuOpen)}
            type="button"
          >
            {isMenuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <nav aria-label="Mobile navigation" className="border-t border-cream-dark bg-surface px-3 py-3 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {[
              ["Shop", "/#shop"],
              ["Our story", "/#story"],
              ["Contact", "/#contact"],
            ].map(([label, href]) => (
              <Link
                className="rounded-xl px-3 py-3 text-sm text-ink hover:bg-cream"
                href={href}
                key={href}
                onClick={closeMenu}
              >
                {label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
