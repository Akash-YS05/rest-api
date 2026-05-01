import type { Metadata } from "next";
import { Syne, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "API Workspace",
  description: "Architectural REST API Interface.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#F9F6F0] text-[#1A1C20] selection:bg-[#D25A46] selection:text-white">
        {children}
        <Analytics/>
      </body>
    </html>
  );
}
