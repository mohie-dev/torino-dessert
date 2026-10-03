import type { ReactNode } from "react";
import { StorefrontLayout } from "@/components/storefront/storefront-layout";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <StorefrontLayout>{children}</StorefrontLayout>;
}
