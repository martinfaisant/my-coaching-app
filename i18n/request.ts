import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import type { Locale } from '@/i18n/types'
import fs from 'node:fs/promises'
import path from 'node:path'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  
  const isLocale = (value: unknown): value is Locale =>
    typeof value === 'string' && (routing.locales as readonly string[]).includes(value)

  if (!isLocale(locale)) {
    locale = routing.defaultLocale
  }

  // Eviter le cache de `import('../messages/${locale}.json')` (qui peut conserver un ancien snapshot)
  // et relire le fichier à partir du disque.
  // `__dirname` n'est pas fiable avec Turbopack (peut pointer vers un dossier temporaire comme C:\\ROOT),
  // donc on essaye plusieurs emplacements (process.cwd() étant le plus probable).
  const candidates = [
    path.resolve(process.cwd(), 'messages', `${locale}.json`),
    path.resolve(process.cwd(), '..', 'messages', `${locale}.json`),
    path.resolve(__dirname ?? '', '..', 'messages', `${locale}.json`),
  ]

  let raw: string | null = null
  let lastErr: unknown = null
  for (const candidate of candidates) {
    try {
      raw = await fs.readFile(candidate, 'utf8')
      break
    } catch (err) {
      lastErr = err
    }
  }

  if (!raw) {
    throw lastErr ?? new Error(`Unable to read messages for locale "${locale}"`)
  }

  const messages = JSON.parse(raw)

  return {
    locale,
    messages,
  };
});
