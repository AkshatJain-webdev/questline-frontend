import type { Metadata } from "next";
import { Geist } from "next/font/google";

import { Providers } from "@/components/Providers";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { cn } from "@/lib/utils";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Questline",
};

// Runs before the first paint, so a saved colour theme doesn't flash the default one.
const RESTORE_COLOR_THEME = `
  const savedColorTheme = localStorage.getItem("color-theme");
  if (savedColorTheme) document.documentElement.dataset.color = savedColorTheme;
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("font-sans", geist.variable)}
      data-color="indigo"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: RESTORE_COLOR_THEME }} />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <Providers>
          <header className="border-b">
            <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-6">
              <span className="font-semibold">Questline</span>
              <ThemeSwitcher />
            </div>
          </header>
          {children}
        </Providers>
      </body>
    </html>
  );
}
