import type { Metadata, Viewport } from "next";
import { Lora, Plus_Jakarta_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ScrollToTop } from "@/components/scroll-to-top";
import { NavProgress } from "@/components/nav-progress";
import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  OG_LOCALE,
  organizationLd,
  websiteLd,
  jsonLd,
} from "@/lib/seo";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0908",
  colorScheme: "dark",
};

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "HM Home — Mobilje me stil në Kosovë",
    template: "%s — HM Home",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  keywords: [
    "mobilje Kosovë",
    "HM Home",
    "divan",
    "kanape",
    "tavolina",
    "dekore",
    "mobilje me stil",
    "mobilje europiane",
    "salloni i mobiljeve",
    "Kosovë",
  ],
  openGraph: {
    title: "HM Home — Mobilje me stil në Kosovë",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: OG_LOCALE,
  },
  twitter: {
    card: "summary_large_image",
    title: "HM Home — Mobilje me stil në Kosovë",
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sq" suppressHydrationWarning>
      <head>
        {jsonLd(organizationLd())}
        {jsonLd(websiteLd())}
      </head>
      <body
        className={`${jakarta.variable} ${lora.variable} ${dmMono.variable} antialiased`}
      >
        <NavProgress />
        <ScrollToTop />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
