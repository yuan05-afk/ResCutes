import type { Metadata, Viewport } from "next";
import { HexclaveProvider, HexclaveTheme } from "@hexclave/next";
import { hexclaveClientApp } from "../stack/client";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ResCutes | Coordinated Animal Rescue",
  description:
    "ResCutes connects citizens, rescuers, shelters, and veterinarians through one coordinated workflow.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ResCutes",
  },
};

export const viewport: Viewport = {
  themeColor: "#183C35",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans min-h-screen`}>
        <HexclaveProvider app={hexclaveClientApp}>
          <HexclaveTheme>
            <Providers>{children}</Providers>
          </HexclaveTheme>
        </HexclaveProvider>
      </body>
    </html>
  );
}
