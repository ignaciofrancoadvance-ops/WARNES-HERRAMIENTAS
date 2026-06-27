import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { siteConfig } from "@/lib/site.config";
import "./globals.css";

// Montserrat: sustituto web de la tipografía de marca (Gotham).
const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700", "800"],
});

const title = `${siteConfig.brand} | ${siteConfig.unit}`;
const description = siteConfig.hero.subtitle;

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL("https://advancegrouparg.com"),
  openGraph: {
    title,
    description,
    type: "website",
    locale: "es_AR",
    siteName: siteConfig.brand,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={montserrat.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
