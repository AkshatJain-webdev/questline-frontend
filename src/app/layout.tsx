import type { Metadata } from "next";

import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Questline",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-50 text-zinc-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
