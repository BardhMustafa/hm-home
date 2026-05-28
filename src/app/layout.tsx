import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "HM Home — Mobilje me stil",
  description:
    "Mobilje të zgjedhura me dorë nga punëtoritë më të mira italiane. Komoditet i pakrahasueshëm, dizajn që zgjat një jetë.",
  openGraph: {
    title: "HM Home — Mobilje me stil",
    description:
      "Mobilje të zgjedhura me dorë nga punëtoritë më të mira italiane.",
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
    <html lang="sq">
      <body
        className={`${outfit.variable} ${cormorant.variable} ${jetbrains.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
