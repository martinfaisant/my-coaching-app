import type { Metadata } from "next";
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
  title: {
    default: "Coach Pro - Coaching sportif personnalisé",
    template: "%s | Coach Pro"
  },
  description: "Plateforme de coaching sportif : programmes d'entraînement sur mesure, suivi en temps réel, synchronisation Strava et messagerie directe avec votre coach.",
  keywords: ["coaching sportif", "entraînement", "running", "cyclisme", "triathlon", "Strava", "programme sportif"],
  authors: [{ name: "Coach Pro" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Coach Pro",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
