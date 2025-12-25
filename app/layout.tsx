import type { Metadata, Viewport } from "next";
import { Inter, Spectral, Karla } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/components/shared/toast-provider";
import { AuthProvider } from "@/lib/hooks/useAuth";
import { Suspense } from "react";

// Configure Inter (Sans) - Primary font, preload
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

// Configure Spectral Light - Secondary font
const spectral = Spectral({ 
  subsets: ["latin"], 
  weight: "300", 
  variable: "--font-spectral", 
  display: "swap",
  preload: false, // Don't preload secondary fonts
});

// Removed Tangerine font - not commonly used, reduces network requests

const karlaBold = Karla({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-karla-bold",
  display: "swap",
  preload: false,
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
};

export const metadata: Metadata = {
  title: "Global Edge",
  description: "Paper bag ecommerce website",
  // Add performance hints
  other: {
    'dns-prefetch': '//placehold.co',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="">
      <head>
        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://placehold.co" />
        <link rel="dns-prefetch" href="https://placehold.co" />
      </head>
      <body
        className={`${inter.variable} ${spectral.variable} ${karlaBold.variable} antialiased bg-background max-w-full`}
      >
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
          <AuthProvider>
            <ToastProvider />
            {children}
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  );
}
