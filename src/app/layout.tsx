import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OMEO",
  description: "Plateforme d'audit Lean IT — OMEO",
  icons: {
    icon: '/omeo-logo.svg',
    shortcut: '/omeo-logo.svg',
    apple: '/omeo-logo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body className={`${inter.className} bg-zinc-950 text-zinc-100 antialiased`}>{children}</body>
    </html>
  );
}
