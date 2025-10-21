import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next"
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quirk Dating - Embrace Your Uniqueness",
  description: "Connect authentically through your quirks. No in-app chats - just real conversations on WhatsApp. Be yourself, find your match.",
  keywords: "dating app, quirky dating, unique personalities, WhatsApp dating, authentic connections",
  authors: [{ name: "whizydan" }],
  creator: "Quirk Dating",
  publisher: "Quirk Dating",
  
  // Open Graph
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://quirkdating.vercel.app",
    siteName: "Quirk Dating",
    title: "Quirk Dating - Embrace Your Uniqueness",
    description: "Connect authentically through your quirks. No in-app chats - just real conversations on WhatsApp.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Quirk Dating - Find Your Unique Match",
      },
    ],
  },
  
  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "Quirk Dating - Embrace Your Uniqueness",
    description: "Connect authentically through your quirks. No in-app chats - just real conversations on WhatsApp.",
    images: ["/og-image.png"],
    creator: "@quirksdating",
  },
  
  // Additional meta
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#EC4899" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Analytics />
        {children}
      </body>
    </html>
  );
}