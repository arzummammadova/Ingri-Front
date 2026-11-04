import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};
import { Fredoka, Poppins } from "next/font/google";
import "@/styles/globals.css";
import { PREFS_BOOT_SCRIPT } from "@/lib/prefsBoot";

const poppins = Poppins({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

const fredoka = Fredoka({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  variable: "--font-fredoka",
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
