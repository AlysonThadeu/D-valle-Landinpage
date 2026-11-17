import type { Metadata, Viewport } from "next";
import { Cormorant, Pinyon_Script } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const pinyon = Pinyon_Script({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pinyon",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "D'VALLE Assessoria | Casamentos e cerimonial em Recife",
    template: "%s | D'VALLE Assessoria",
  },
  description:
    "Assessoria e cerimonial de casamentos com Talyson Oberto. Presencial em Recife e Região Metropolitana, consultoria online para todo o Brasil.",
  openGraph: {
    siteName: "D'VALLE Assessoria",
    title: "D'VALLE Assessoria",
    description: "Seu sim merece ser vivido por inteiro.",
    images: ["/images/talyson-oberto.jpg"],
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#fff8e7",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${pinyon.variable}`}>
      <body>{children}</body>
    </html>
  );
}
