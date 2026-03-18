import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import type { Locale } from '@/i18n/types'
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });
  
  return {
    title: {
      default: "My Sport Ally - Coaching sportif personnalisé",
      template: "%s | My Sport Ally"
    },
    description: "Plateforme de coaching sportif : programmes d'entraînement sur mesure, suivi en temps réel, synchronisation Strava et messagerie directe avec votre coach.",
    keywords: ["coaching sportif", "entraînement", "running", "cyclisme", "triathlon", "Strava", "programme sportif"],
    authors: [{ name: "My Sport Ally" }],
    openGraph: {
      type: "website",
      locale: locale === 'fr' ? "fr_FR" : "en_US",
      siteName: "My Sport Ally",
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Ensure that the incoming `locale` is valid
  const isLocale = (value: unknown): value is Locale =>
    typeof value === 'string' && (routing.locales as readonly string[]).includes(value)

  if (!isLocale(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
