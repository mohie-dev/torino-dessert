import type { ReactNode } from "react";
import { Footer } from "@/components/storefront/footer";
import { Navbar } from "@/components/storefront/navbar";

export function StorefrontLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
