import type { Metadata, Viewport } from "next";
import { Lora, Plus_Jakarta_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ScrollToTop } from "@/components/scroll-to-top";
import { NavProgress } from "@/components/nav-progress";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hmhome.al";

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
    default: "HM Home — Mobilje me stil",
    template: "%s — HM Home",
  },
  description:
    "Mobilje të zgjedhura me dorë nga punëtoritë më të mira europiane. Komoditet i pakrahasueshëm, dizajn që zgjat një jetë.",
  applicationName: "HM Home",
  keywords: [
    "mobilje",
    "HM Home",
    "divan",
    "kanape",
    "dekore",
    "mobilje me stil",
    "Kosovë",
    "Shqipëri",
  ],
  openGraph: {
    title: "HM Home — Mobilje me stil",
    description:
      "Mobilje të zgjedhura me dorë nga punëtoritë më të mira europiane.",
    url: SITE_URL,
    siteName: "HM Home",
    type: "website",
    locale: "sq_AL",
  },
  twitter: {
    card: "summary_large_image",
    title: "HM Home — Mobilje me stil",
    description:
      "Mobilje të zgjedhura me dorë nga punëtoritë më të mira europiane.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sq" suppressHydrationWarning>
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
