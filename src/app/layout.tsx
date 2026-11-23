import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};
import localFont from "next/font/local";
import "@/styles/globals.css";
import { PREFS_BOOT_SCRIPT } from "@/lib/prefsBoot";

// Self-hosted (latin + latin-ext subsets of the official Google Fonts files) so the
// build never depends on fetching fonts.googleapis.com at build time.
const poppins = localFont({
  src: [
    { path: "./fonts/poppins-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/poppins-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/poppins-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/poppins-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/poppins-800.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-poppins",
  display: "swap",
  fallback: ["system-ui", "Arial", "sans-serif"],
});

const fredoka = localFont({
  src: [{ path: "./fonts/fredoka-var.woff2", weight: "300 700", style: "normal" }],
  variable: "--font-fredoka",
  display: "swap",
  fallback: ["system-ui", "Arial", "sans-serif"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:43123";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Ingri",
  title: { default: "Ingri", template: "%s · Ingri" },
  description: "Ingri — English for Azerbaijani speakers.",
  icons: { icon: "/brand/ingri-mark.svg", apple: "/brand/ingri-logo-source.jpg" },
  openGraph: {
    type: "website",
    siteName: "Ingri",
    title: "Ingri",
    description: "Ingri — English for Azerbaijani speakers.",
    images: [{ url: "/brand/ingri-logo-source.jpg", width: 1024, height: 1024, alt: "Ingri" }],
  },
  twitter: { card: "summary", title: "Ingri", images: ["/brand/ingri-logo-source.jpg"] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning className={`${poppins.variable} ${fredoka.variable} h-full`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREFS_BOOT_SCRIPT }} />
      </head>
      <body className="min-h-full bg-background font-sans text-foreground antialiased">{children}</body>
    </html>
  );
}
