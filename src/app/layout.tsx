import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";

import { AppShell } from "@/components/finance/app-shell";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
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
  themeColor: "#0b1210",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`${manrope.variable} h-full dark antialiased`}>
      <body className="min-h-full bg-background font-sans text-foreground">
        <AppShell>{children}</AppShell>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
