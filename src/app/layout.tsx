import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Inter, DM_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ScrollToTop } from "@/components/scroll-to-top";
import { NavProgress } from "@/components/nav-progress";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const bodoni = Bodoni_Moda({
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
  title: "HM Home — Mobilje me stil",
  description:
    "Mobilje të zgjedhura me dorë nga punëtoritë më të mira europiane. Komoditet i pakrahasueshëm, dizajn që zgjat një jetë.",
  openGraph: {
    title: "HM Home — Mobilje me stil",
    description:
      "Mobilje të zgjedhura me dorë nga punëtoritë më të mira europiane.",
    type: "website",
    locale: "sq_AL",
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
        className={`${inter.variable} ${bodoni.variable} ${dmMono.variable} antialiased`}
      >
        <NavProgress />
        <ScrollToTop />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
