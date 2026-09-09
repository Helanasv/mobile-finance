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
  title: "Карман — личные финансы",
  description:
    "Мобильное приложение для учёта доходов, расходов и месячных бюджетов.",
  appleWebApp: {
    capable: true,
    title: "Карман",
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
        <AppShell>{children}</AppShell>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
