import type { Metadata, Viewport } from "next";
import { Manrope, Noto_Serif } from "next/font/google";

import { AppShell } from "@/components/finance/app-shell";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
});

const notoSerif = Noto_Serif({
  variable: "--font-fraunces",
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  title: "Достаток — учёт доходов и расходов",
  description:
    "Мобильное приложение для учёта доходов, расходов и месячных бюджетов.",
  appleWebApp: {
    capable: true,
    title: "Достаток",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#1a1612",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`${manrope.variable} ${notoSerif.variable} h-full dark antialiased`}>
      <body className="min-h-full bg-background font-sans text-foreground">
        <p
          id="dostatok-boot"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1a1612] p-6 text-center text-lg leading-relaxed text-[#f6e7c8]"
        >
          Достаток загружается. Если экран пустой — в Safari откройте http://localhost:43123
        </p>
        <AppShell>{children}</AppShell>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
