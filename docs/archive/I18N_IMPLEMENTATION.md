# Internationalisation (i18n) - Implémentation Complétée

**Date**: 14 février 2026  
**Langues supportées**: Français (fr) - par défaut, Anglais (en)  
**Bibliothèque**: next-intl 3.x  
**Statut**: ✅ Implémentation de base complétée

---

## 📋 Résumé

L'application est maintenant bilingue (français/anglais) avec une architecture extensible pour ajouter d'autres langues facilement.

### Ce qui a été fait

✅ **Infrastructure i18n**
- Installation et configuration de next-intl
- Middleware de détection/routage de locale
- Structure de fichiers i18n/ et messages/
- Restructuration du layout avec `[locale]`

✅ **Fichiers de traduction**
- `messages/fr.json` - Traductions françaises complètes (~200+ clés)
- `messages/en.json` - Traductions anglaises complètes
- Namespaces organisés: common, auth, navigation, sports, workouts, goals, profile, coach, devices, chat, errors, metadata

✅ **Utilitaires lib/ mis à jour**
- `lib/sportStyles.ts` - Ajout de `SPORT_TRANSLATION_KEYS`
- `lib/authHelpers.ts` - Codes d'erreur pour traduction
- `lib/workoutValidation.ts` - Codes d'erreur de validation
- `lib/authErrors.ts` - Codes d'erreur auth

✅ **Composants prioritaires migrés**
- `Sidebar` - Navigation complète traduite
- `LoginForm` - Formulaires login/signup/reset traduits
- `AuthButtons` - Boutons CTA traduits
- `LanguageSwitcher` - Composant de changement de langue intégré dans Sidebar

✅ **Structure de routing**
- Routes déplacées dans `app/[locale]/`
- API routes restées à la racine (`app/api/`, `app/auth/`)
- Middleware gérant automatiquement les redirections de locale

---

## 🗂️ Structure des fichiers

```
/i18n
  ├── request.ts      # Configuration i18n
  └── routing.ts      # Configuration routing (locales, default)
/messages
  ├── fr.json         # Traductions françaises
  └── en.json         # Traductions anglaises
/app
  ├── [locale]/       # Routes localisées
  │   ├── layout.tsx  # Layout avec NextIntlClientProvider
  │   ├── page.tsx    # Landing page
  │   ├── dashboard/  # Dashboard
  │   ├── login/      # Login
  │   ├── etc.
  ├── api/            # API routes (non-localisées)
  └── auth/           # Auth callbacks (non-localisées)
middleware.ts         # Middleware next-intl
```

---

## 🎯 Utilisation

### Dans un Server Component

```typescript
import { useTranslations } from 'next-intl';

export default function MyPage() {
  const t = useTranslations('navigation');
  
  return <h1>{t('dashboard')}</h1>;
}
```

### Dans un Client Component

```typescript
'use client';

import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations('common');
  
  return <button>{t('save')}</button>;
}
```

### Dans les Server Actions

```typescript
'use server';

import { getTranslations } from 'next-intl/server';

export async function myAction(locale: string) {
  const t = await getTranslations({ locale, namespace: 'auth.errors' });
  
  if (!user) {
    return createError(t('notAuthenticated'), 'AUTH_REQUIRED');
  }
}
```

### Labels de sports dynamiques

```typescript
import { SPORT_TRANSLATION_KEYS } from '@/lib/sportStyles';
import { useTranslations } from 'next-intl';

const t = useTranslations();
const sportLabel = t(SPORT_TRANSLATION_KEYS[sportType]);
```

---

## 🔄 Changement de langue

Le composant `LanguageSwitcher` est intégré dans la Sidebar. Il permet de basculer entre FR et EN avec persistance de l'URL courante.

**Exemple d'utilisation**:
```typescript
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

<LanguageSwitcher />
```

---

## 🌐 URLs et routing

### Configuration actuelle

- **Locale par défaut**: Français (fr)
- **Prefix mode**: `as-needed`
  - URL française : `/` (pas de prefix)
  - URL anglaise : `/en/`

**Exemples**:
- Français : `https://example.com/dashboard`
- Anglais : `https://example.com/en/dashboard`

### Middleware

Le middleware `next-intl` gère automatiquement:
- Détection de la langue du navigateur
- Redirection vers la bonne locale
- Persistence de la locale dans l'URL

---

## ➕ Ajouter une nouvelle langue

### 1. Créer le fichier de traduction

Copier `messages/en.json` vers `messages/es.json` (par exemple pour l'espagnol) et traduire.

### 2. Mettre à jour la configuration

**`i18n/routing.ts`**:
```typescript
export const routing = defineRouting({
  locales: ['fr', 'en', 'es'],
  defaultLocale: 'fr',
  localePrefix: 'as-needed'
});
```

**`middleware.ts`**:
```typescript
export const config = {
  matcher: ['/', '/(fr|en|es)/:path*', '/((?!_next|_vercel|.*\\..*).*)']
};
```

### 3. Ajouter le bouton dans LanguageSwitcher

```typescript
<Button
  variant={currentLocale === 'es' ? 'primary' : 'outline'}
  onClick={() => switchLocale('es')}
>
  ES
</Button>
```

**C'est tout !** Aucune modification de code ailleurs n'est nécessaire.

---

## 📝 Namespaces de traduction

### `common`
Actions génériques : save, cancel, delete, edit, close, retry, add, search, filter

### `auth`
Authentification : login, signup, password, email, errors d'auth

### `navigation`
Menu principal : findCoach, calendar, goals, myCoach, devices, athletes, offers, profile

### `sports`
Labels de sports : course, velo, natation, muscu, triathlon, etc.

### `workouts`
Entraînements : title, description, date, duration, validation

### `goals`
Objectifs : addGoal, targetDate, status, validation

### `profile`
Profil utilisateur : firstName, lastName, bio, location, validation

### `coach`
Coach : findCoach, requestCoach, rating, validation

### `devices`
Appareils connectés : connectStrava, syncActivities, validation

### `chat`
Chat : placeholder, send, noMessages

### `errors`
Erreurs globales : somethingWrong, notFound, unauthorized, serverError

### `metadata`
SEO : dashboardTitle, calendarTitle, etc.

---

## 🔧 Migration en cours

### ✅ Complété

1. Infrastructure et configuration
2. Fichiers de traduction (FR/EN)
3. Utilitaires lib/
4. Composants prioritaires (Sidebar, LoginForm, AuthButtons)
5. LanguageSwitcher

### 🔄 En cours / À faire

1. **Composants restants** à migrer:
   - `WorkoutModal` - Modal d'entraînement (~889 lignes)
   - `FindCoachSection` - Recherche de coach
   - `Modal` - aria-label="Fermer"
   - `Button` - États "Enregistré" / "Non enregistré"
   - `ChatModule` - Placeholder
   - Autres composants avec texte

2. **Server Actions** à vérifier:
   - `app/[locale]/login/actions.ts`
   - `app/[locale]/dashboard/actions.ts`
   - `app/[locale]/dashboard/profile/actions.ts`
   - `app/[locale]/dashboard/workouts/actions.ts`
   - `app/[locale]/dashboard/objectifs/actions.ts`
   - Autres actions

3. **Pages** à traduire:
   - `app/[locale]/page.tsx` - Landing page (hero, features, CTA)
   - Pages dashboard (metadata)
   - Pages d'erreur (`error.tsx`, `dashboard/error.tsx`)

4. **Dates**:
   - Adapter `lib/dateUtils.ts` pour accepter le paramètre `locale`

---

## 🚀 Prochaines étapes recommandées

### Court terme (essentielles)

1. **Tester l'application** avec les deux langues
2. **Migrer WorkoutModal** (composant très utilisé)
3. **Migrer la landing page** (`app/[locale]/page.tsx`)
4. **Adapter dateUtils** pour gérer les locales dynamiquement

### Moyen terme

1. Migrer tous les composants restants
2. S'assurer que toutes les server actions fonctionnent
3. Traduire tous les messages d'erreur et de succès
4. Ajouter les traductions de metadata pour le SEO

### Long terme

1. Ajouter d'autres langues (espagnol, italien, allemand)
2. Implémenter le typage strict des clés de traduction (TypeScript)
3. Intégrer un outil de gestion de traductions (IntlPull, Crowdin)
4. Tester les parcours critiques dans les deux langues

---

## ⚠️ Points d'attention

### RLS Supabase
✅ Pas d'impact - Les politiques RLS restent identiques

### Performance
✅ next-intl est optimisé pour SSR et RSC - Pas de problème de performance

### SEO
⚠️ **À faire** : Configurer correctement les balises `<html lang={locale}>` et les métadonnées dans chaque page

### TypeScript
💡 **Optionnel** : Possibilité d'ajouter le typage strict des clés (voir docs next-intl)

### Tests
⚠️ **À faire** : Tester les parcours critiques (auth, création workout, recherche coach) dans les deux langues

---

## 📚 Ressources

- [Documentation next-intl](https://next-intl.dev/)
- [App Router setup](https://next-intl.dev/docs/getting-started/app-router)
- [Plan d'implémentation](c:\Users\marti\.cursor\plans\internationalisation_bilingue_8337820e.plan.md)

---

## 🐛 Dépannage

### L'app ne démarre pas
- Vérifier que `next-intl` est bien installé : `npm list next-intl`
- Vérifier que les fichiers `messages/fr.json` et `messages/en.json` sont valides (JSON valide)
- Vérifier que le middleware est bien à la racine : `middleware.ts`

### Traductions manquantes
- Vérifier que la clé existe dans les deux fichiers `fr.json` et `en.json`
- Vérifier le namespace : `t('navigation.dashboard')` au lieu de `t('dashboard')`

### Erreur de routing
- Vérifier que toutes les routes sont dans `app/[locale]/`
- API routes doivent rester dans `app/api/` (pas dans [locale])
- Auth callbacks doivent rester dans `app/auth/` (pas dans [locale])

---

**Implémentation complétée le 14 février 2026**  
**Prêt pour les tests et la migration incrémentale des composants restants**
