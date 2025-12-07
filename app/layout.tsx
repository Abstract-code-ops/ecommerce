import type { Metadata } from "next";
import { Inter, Spectral, Tangerine, Karla } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/header";
import Footer from "@/components/shared/footer";

// Configure Inter (Sans)
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Configure Spectral Light
const spectral = Spectral({ subsets: ["latin"], weight: "300", variable: "--font-spectral", display: "swap" });

// Configure Tangerine
const tangerine = Tangerine({
  subsets: ["latin"],
  weight: "400", // Tangerine only has weight 400
  variable: "--font-tangerine", // This defines the CSS variable name
  display: "swap",
});

const karlaBold = Karla({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-karla-bold",
  display: "swap"
})

export const metadata: Metadata = {
  title: "Paperly",
  description: "Paper bag ecommerce website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="">
      <body
        className={`${inter.variable} ${spectral.variable} ${tangerine.variable} ${karlaBold.variable} antialiased bg-background max-w-full`}
      >
        {children}
      </body>
    </html>
  );
}
