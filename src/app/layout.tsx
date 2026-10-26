import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import type { ReactNode } from "react";
import AppShell from "@/components/AppShell";
import { ToastProvider } from "@/components/ui/Toast";
import { SHARE_TEXT, SHARE_URL } from "@/lib/share";
import "./globals.css";

const display = Bebas_Neue({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  // Absolute URLs for the share preview image (opengraph-image.tsx).
  metadataBase: new URL(SHARE_URL),
  title: { default: "Mission Fragrances", template: "%s · Mission Fragrances" },
  description: "Honor. Courage. Commitment. Put them into action.",
  manifest: "/manifest.webmanifest",
  applicationName: "Mission Fragrances",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Mission Fragrances",
  },
  openGraph: {
    type: "website",
    siteName: "Mission Fragrances",
    title: "Mission Fragrances: Turn Scent Into Action",
    description: SHARE_TEXT.short,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mission Fragrances: Turn Scent Into Action",
    description: SHARE_TEXT.short,
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#07090D",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="antialiased">
        <ToastProvider>
          <AppShell>{children}</AppShell>
        </ToastProvider>
      </body>
    </html>
  );
}
