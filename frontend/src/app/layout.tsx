import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Torino Dessert | A little sweetness, every day",
    template: "%s | Torino Dessert",
  },
  description:
    "Discover handcrafted cakes and desserts, freshly made by Torino Dessert.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
