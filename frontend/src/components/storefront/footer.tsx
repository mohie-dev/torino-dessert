"use client";

import { useQuery } from "@tanstack/react-query";
import { Facebook, Instagram, MessageCircle, Phone } from "lucide-react";
import { fetchStoreSettings } from "@/lib/store-api";

function whatsappHref(value: string): string {
  if (/^https?:\/\//i.test(value)) return value;
  return `https://wa.me/${value.replace(/\D/g, "")}`;
}

export function Footer() {
  const settingsQuery = useQuery({
    queryKey: ["storefront", "settings"],
    queryFn: fetchStoreSettings,
    staleTime: 60_000,
  });
  const settings = settingsQuery.data;

  return (
    <footer className="bg-chocolate-dark text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 border-b border-white/15 pb-10 md:grid-cols-[1fr_1fr] md:gap-16">
          <div>
            <p className="font-display text-3xl font-semibold">
              A little sweetness, every day.
            </p>
            <p className="mt-3 max-w-lg text-sm leading-6 text-white/70">
              Thoughtfully made desserts, crafted with care and shared with the
              people you love.
            </p>
          </div>

          <section
            aria-labelledby="footer-contact-title"
            className="scroll-mt-24"
            id="contact"
          >
            <h2
              className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55"
              id="footer-contact-title"
            >
              Get in touch
            </h2>
            {settingsQuery.isLoading ? (
              <div aria-label="Loading contact details" className="mt-4 space-y-3">
                <div className="h-5 w-44 animate-pulse rounded bg-white/10" />
                <div className="h-5 w-36 animate-pulse rounded bg-white/10" />
              </div>
            ) : settings ? (
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-4">
                {settings.phone && (
                  <a
                    className="inline-flex items-center gap-2 text-sm text-white/85 transition hover:text-white"
                    href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}
                  >
                    <Phone aria-hidden="true" size={17} />
                    <span>{settings.phone}</span>
                  </a>
                )}
                {settings.whatsapp && (
                  <a
                    className="inline-flex items-center gap-2 text-sm text-white/85 transition hover:text-white"
                    href={whatsappHref(settings.whatsapp)}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <MessageCircle aria-hidden="true" size={17} />
                    <span>WhatsApp</span>
                  </a>
                )}
                {settings.instagramUrl && (
                  <a
                    aria-label="Instagram"
                    className="inline-flex items-center gap-2 text-sm text-white/85 transition hover:text-white"
                    href={settings.instagramUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <Instagram aria-hidden="true" size={17} />
                    Instagram
                  </a>
                )}
                {settings.facebookUrl && (
                  <a
                    aria-label="Facebook"
                    className="inline-flex items-center gap-2 text-sm text-white/85 transition hover:text-white"
                    href={settings.facebookUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <Facebook aria-hidden="true" size={17} />
                    Facebook
                  </a>
                )}
                {!settings.phone &&
                  !settings.whatsapp &&
                  !settings.instagramUrl &&
                  !settings.facebookUrl && (
                    <p className="text-sm text-white/65">
                      Contact details will be available soon.
                    </p>
                  )}
              </div>
            ) : (
              <p className="mt-4 text-sm text-white/65">
                Contact details are temporarily unavailable.
              </p>
            )}
          </section>
        </div>

        <p className="pt-5 text-xs text-white/55">
          © {new Date().getFullYear()} Torino Dessert. Made with care.
        </p>
      </div>
    </footer>
  );
}
