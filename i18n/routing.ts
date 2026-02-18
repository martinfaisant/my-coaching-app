import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
  localePrefix: 'as-needed', // /en/dashboard for English, but / for French (default)
  // Désactiver la détection automatique via Accept-Language / cookie NEXT_LOCALE.
  // Sans ça, intlMiddleware redirige /dashboard → /en/dashboard (Accept-Language: en),
  // puis le proxy locale-switch redirige /en/dashboard → /dashboard → boucle infinie.
  // La locale est déterminée par le préfixe d'URL uniquement.
  // Le proxy gère la redirection des utilisateurs connectés vers leur locale préférée.
  localeDetection: false,
});
