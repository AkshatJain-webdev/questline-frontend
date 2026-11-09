import type { Metadata } from "next";
import { Geist } from "next/font/google";

import { AppSidebar } from "@/components/AppSidebar";
import { Providers } from "@/components/Providers";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
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
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <header className="flex h-12 items-center border-b px-3">
                <SidebarTrigger />
              </header>
              {children}
            </SidebarInset>
          </SidebarProvider>
        </Providers>
      </body>
    </html>
  );
}
