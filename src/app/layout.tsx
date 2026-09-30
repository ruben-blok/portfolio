import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Instrument_Serif } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-instrument-sans",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ruben-blok.github.io/portfolio";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Ruben Blok — Junior full-stack developer",
  description:
    "Portfolio van Ruben Blok, junior full-stack developer in Rotterdam. Projecten, stack en contact.",
  alternates: {
    canonical: "/",
  },
  authors: [{ name: "Ruben Blok", url: "https://github.com/ruben-blok" }],
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: "/",
    title: "Ruben Blok — Junior full-stack developer",
    description:
      "Portfolio van Ruben Blok, junior full-stack developer in Rotterdam. Projecten, stack en contact.",
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f6f1",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={`${instrumentSerif.variable} ${instrumentSans.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-5 focus:z-50 focus:bg-forest focus:px-5 focus:py-3 focus:text-note focus:font-medium focus:text-paper"
        >
          Direct naar inhoud
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
