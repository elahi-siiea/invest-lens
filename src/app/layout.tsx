import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/instrument-sans";
import "./globals.css";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { THEME_INIT_SCRIPT } from "@/components/layout/theme";

export const metadata: Metadata = {
  title: { default: "Invest Lens", template: "%s | Invest Lens" },
  description:
    "Compare how investments have grown and explore how savings could grow over time. For educational purposes only.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-dvh flex-col bg-paper text-ink antialiased">
        <AppHeader />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">{children}</main>
        <AppFooter />
      </body>
    </html>
  );
}
