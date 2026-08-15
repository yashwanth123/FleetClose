import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, Outfit } from "next/font/google";
import { HashScroll } from "@/components/hash-scroll";
import "./globals.css";

const sans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "FleetClose — Turn alerts into closed work",
  description:
    "FleetClose helps mid-market trucking companies turn telematics and maintenance alerts into work orders, notifications, and a decision trail — so trucks keep running.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${sans.variable} ${display.variable} ${mono.variable} antialiased`}>
        <HashScroll />
        {children}
      </body>
    </html>
  );
}
