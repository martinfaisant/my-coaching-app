# Hotfix - Corrections i18n et Proxy

**Date**: 14 février 2026  
**Problèmes résolus**: 
1. ⚠️ Warning middleware → proxy
2. ❌ Page d'accueil ne charge pas

---

## 🐛 Problèmes identifiés

### 1. Fichier middleware.ts au lieu de proxy.ts

**Symptôme**: Warning `The "middleware" file convention is deprecated. Please use "proxy" instead.`

**Cause**: Next.js 16 utilise `proxy.ts` au lieu de `middleware.ts`. J'avais créé `middleware.ts` pour next-intl sans tenir compte de cette convention.

**Impact**: Le middleware n'était pas exécuté correctement, empêchant l'i18n et l'authentification de fonctionner.

### 2. Authentification Supabase et i18n non combinés

**Symptôme**: Perte de l'authentification Supabase après l'implémentation i18n

**Cause**: Le `proxy.ts` original gérait uniquement Supabase. En le remplaçant par le middleware next-intl, la logique d'authentification était perdue.

**Impact**: Les redirections d'auth et le rafraîchissement de session ne fonctionnaient plus.

### 3. Layout [locale] avec params non-async

**Symptôme**: Erreurs TypeScript potentielles

**Cause**: Next.js 16 requiert que les `params` soient traités comme des Promise.

**Impact**: Incompatibilité avec la nouvelle API de Next.js 16.

---

## ✅ Corrections appliquées

### 1. Proxy.ts combiné (i18n + auth)

**Fichier**: `proxy.ts`

Le nouveau proxy combine:
- **next-intl middleware** pour la gestion des locales
- **Supabase auth** pour l'authentification et le rafraîchissement de session
- **Redirections** adaptées aux locales (FR/EN)

```typescript
export async function proxy(request: NextRequest) {
  // 1. Gère i18n (sauf pour API routes)
  const isApiRoute = pathname.startsWith('/api') || pathname.startsWith('/auth')
  let response = isApiRoute ? NextResponse.next() : intlMiddleware(request)
  
  // 2. Gère Supabase auth
  const supabase = createServerClient(...)
  const { data: { user } } = await supabase.auth.getUser()
  
  // 3. Gère redirections avec locale
  // Ex: /dashboard → /login (FR) ou /en/dashboard → /en/login (EN)
  
  return response
}
```

### 2. Layout [locale] avec params async

**Fichier**: `app/[locale]/layout.tsx`

```typescript
// Avant (Next.js 15)
export default async function LocaleLayout({
  params: { locale }
}: {
  params: { locale: string };
})

// Après (Next.js 16)
export default async function LocaleLayout({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // ...
}
```

**Appliqué aussi à**:
- `generateMetadata()`

### 3. Routes API/Auth non-localisées

Les routes suivantes restent à la racine (`app/`) et ne sont pas localisées:
- `app/api/*` - API routes
- `app/auth/*` - Callbacks d'authentification

---

## 🔄 Flux de routing

### Page d'accueil (`/`)

1. next-intl middleware détecte la langue du navigateur
2. Redirige automatiquement:
   - Navigateur FR → affiche `app/[locale]/page.tsx` avec locale='fr'
   - Navigateur EN → redirige vers `/en` → affiche avec locale='en'

### Routes protégées (`/dashboard`)

1. next-intl résout la locale (fr par défaut, ou en si prefix présent)
2. Proxy Supabase vérifie l'authentification
3. Si non connecté:
   - FR: Redirige vers `/login?redirect=/dashboard`
   - EN: Redirige vers `/en/login?redirect=/en/dashboard`

### Routes API (`/api/*`)

1. Skip i18n (pas de locale)
2. Gère uniquement Supabase auth
3. Pas de redirection

---

## 🧪 Tests à effectuer

### ✅ À vérifier

1. **Page d'accueil**:
   - [ ] `/` charge correctement en français
   - [ ] `/en` charge correctement en anglais
   - [ ] Le sélecteur de langue fonctionne

2. **Authentification**:
   - [ ] Redirection `/dashboard` → `/login` si non connecté
   - [ ] Connexion redirige vers dashboard dans la bonne locale
   - [ ] Session persiste après rafraîchissement

3. **Navigation localisée**:
   - [ ] Sidebar affiche les labels traduits
   - [ ] Changement de langue via LanguageSwitcher fonctionne
   - [ ] URLs conservent la locale (`/en/dashboard/objectifs`)

4. **Routes API**:
   - [ ] `/api/auth/strava` fonctionne
   - [ ] `/auth/callback` fonctionne
   - [ ] Pas de redirection i18n sur ces routes

---

## 📝 Configuration actuelle

### Locales supportées
- **Français (fr)**: Locale par défaut, pas de prefix (`/dashboard`)
- **Anglais (en)**: Avec prefix (`/en/dashboard`)

### Matchers proxy
```typescript
matcher: [
  '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
]
```

Exclut:
- Fichiers statiques Next.js
- Images
- Favicon
- Assets (svg, png, jpg, etc.)

### Routes publiques (sans auth)
- `/` - Landing page
- `/login` - Connexion
- `/reset-password` - Réinitialisation

### Routes protégées (avec auth)
- `/dashboard/*` - Dashboard utilisateur
- `/admin/*` - Administration

---

## 🚀 Prochaines étapes

1. **Tester le serveur de dev**
   ```bash
   npm run dev
   ```

2. **Vérifier que `/` charge**
   - Naviguer vers `http://localhost:3000`
   - Vérifier que la landing page s'affiche

3. **Tester l'authentification**
   - Créer un compte / Se connecter
   - Vérifier la redirection vers dashboard
   - Vérifier que la session persiste

4. **Tester le changement de langue**
   - Utiliser le LanguageSwitcher dans le Sidebar
   - Vérifier que l'URL et le contenu changent

5. **Vérifier la console**
   - Plus de warning "middleware deprecated"
   - Pas d'erreurs TypeScript

---

## 🔧 Commandes utiles

```bash
# Démarrer le serveur
npm run dev

# Build pour vérifier les erreurs
npm run build

# Check TypeScript
npx tsc --noEmit
```

---

**Corrections complétées le 14 février 2026**  
**Prêt pour les tests**
