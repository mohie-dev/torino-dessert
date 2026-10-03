import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { Catalog } from "@/components/storefront/catalog";

export default function HomePage() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-cream">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:gap-10 sm:px-6 sm:py-14 md:min-h-[590px] md:grid-cols-[1fr_0.9fr] lg:px-8 lg:py-20">
          <div className="relative z-10 min-w-0 max-w-xl">
            <h1 className="min-w-0 font-display text-[clamp(2.6rem,12.8vw,3.25rem)] font-semibold leading-[0.98] text-chocolate sm:text-7xl lg:text-[5.5rem]">
              Made to be
              <span className="block italic text-velvet">remembered.</span>
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-muted sm:mt-6 sm:text-base sm:leading-7">
              Beautifully crafted desserts, made with generous hearts and the
              finest ingredients. Find a new favorite for your table.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8 sm:gap-4">
              <Link
                className="inline-flex min-h-12 items-center gap-3 rounded-full bg-velvet px-5 text-sm font-semibold text-white shadow-card transition hover:bg-velvet-dark sm:px-6 sm:text-base"
                href="#shop"
              >
                Explore the menu <ArrowRight size={17} />
              </Link>
              <span className="text-xs text-muted sm:text-sm">Handcrafted in every detail</span>
            </div>
            <a className="mt-8 hidden items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-chocolate/70 sm:mt-14 sm:inline-flex" href="#shop">
              Scroll to discover <ArrowDown size={14} />
            </a>
          </div>

          <div className="relative mx-auto aspect-[1/0.94] w-full max-w-[390px] md:aspect-[4/4.2] md:max-w-[540px]">
            <div className="absolute inset-5 rotate-3 rounded-[44%_56%_52%_48%/42%_42%_58%_58%] bg-[#e7c7aa]" />
            <div className="absolute inset-0 overflow-hidden rounded-[44%_56%_52%_48%/42%_42%_58%_58%] shadow-elevated">
              <Image
                alt="A selection of handcrafted cakes and pastries"
                className="object-cover"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 45vw"
                src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=85"
              />
            </div>
            <div className="absolute -bottom-2 left-2 rounded-2xl bg-surface px-4 py-3 shadow-card sm:left-0 sm:rounded-3xl sm:px-5 sm:py-4">
              <p className="font-display text-lg font-semibold text-chocolate sm:text-xl">Made with love</p>
              <p className="mt-1 text-[11px] text-muted sm:text-xs">From our kitchen to your table</p>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-24 top-8 size-72 rounded-full border border-chocolate/10" />
        <div className="pointer-events-none absolute -right-12 top-20 size-48 rounded-full border border-chocolate/10" />
      </section>

      <Catalog />

      <section className="bg-cream/65" id="story">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-2 md:items-center lg:px-8 lg:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-chocolate-light">A sweeter way to gather</p>
            <h2 className="mt-3 max-w-lg font-display text-4xl font-semibold leading-tight text-chocolate sm:text-5xl">
              The best moments always leave room for dessert.
            </h2>
          </div>
          <div className="md:pl-12">
            <p className="text-base leading-7 text-muted">
              We believe the little things deserve a little celebration. Every
              Torino treat is made to bring people together—with thoughtful
              ingredients, careful hands, and a touch of everyday magic.
            </p>
            <Link className="mt-6 inline-flex items-center gap-2 font-semibold text-velvet hover:text-velvet-dark" href="#shop">
              Find something lovely <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
