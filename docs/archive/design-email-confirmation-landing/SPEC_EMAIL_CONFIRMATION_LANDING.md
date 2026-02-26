# Spec technique – Atterrissage après confirmation email (Option B)

**Mode :** Architecte  
**Date :** 26 février 2026  
**Référence :** User stories `USER_STORIES_EMAIL_CONFIRMATION_LANDING.md`, mockup Option B dans `mockup-email-confirmation-landing.html`

---

## 1. Vue d’ensemble

Après clic sur « Confirmer mon email » dans l’email d’inscription, l’utilisateur est redirigé vers la **page d’accueil** avec un paramètre `emailConfirmed=1`. Si une **session** a déjà été créée par l’échange de code (cas standard Supabase PKCE), on redirige directement vers le dashboard. Sinon, la page d’accueil affiche une **modale** « Email validé » contenant un formulaire de connexion ; après connexion réussie, redirection vers le dashboard.

**Comportement en cas d’erreur du callback** (lien expiré, déjà utilisé) : redirection vers la page de login avec la locale et un paramètre d’erreur pour afficher un message (ex. « Lien invalide ou expiré »). Pas de modale sur la home pour ce cas.

---

## 2. Décisions d’architecture

| Point | Décision |
|-------|----------|
| **Locale dans le callback** | La route `/auth/callback` n’a pas accès à `[locale]`. La locale est déduite de `user_metadata.locale` (enregistrée au signup) après `exchangeCodeForSession`. Si absente : défaut `fr`. |
| **Session déjà créée** | Après `exchangeCodeForSession(code)` réussi, Supabase crée une session. Redirection vers `/[locale]/?emailConfirmed=1`. Côté page d’accueil : si l’utilisateur est **déjà authentifié** (session présente), redirection immédiate vers `/[locale]/dashboard` sans afficher la modale. Sinon, affichage de la modale avec formulaire de connexion. |
| **Erreur callback (lien expiré / déjà utilisé)** | Redirection vers `/[locale]/login?error=confirmation_failed`. La page login affiche le message d’erreur existant (`auth.invalidOrExpiredLink` ou clé dédiée) lorsque ce paramètre est présent. Locale déduite de l’en-tête Accept-Language ou défaut `fr`. |
| **Redirection après login depuis la modale** | Réutilisation de l’action `login` existante. La redirection doit préserver la locale : utiliser `getLocale()` et rediriger vers `/${locale === 'en' ? 'en' : ''}/dashboard` (aligné avec `localePrefix: 'as-needed'`). À intégrer dans l’action `login` si ce n’est pas déjà le cas. |

---

## 3. Modèle de données et RLS

**Aucun changement** : pas de nouvelle table, pas de modification de schéma ni de RLS. On s’appuie sur l’auth Supabase et les métadonnées utilisateur existantes (`user_metadata.locale`).

---

## 4. Table des fichiers

| Fichier | Rôle | Créer / Modifier |
|---------|------|-------------------|
| `app/auth/callback/route.ts` | Redirection après confirmation : succès → `/[locale]/?emailConfirmed=1` ; erreur → `/[locale]/login?error=confirmation_failed`. Locale depuis `user_metadata` ou Accept-Language. | **Modifier** |
| `app/[locale]/page.tsx` | Page d’accueil : lire `searchParams.emailConfirmed` ; si session présente + paramètre → redirect dashboard ; sinon si paramètre présent → rendre un wrapper client avec prop pour ouvrir la modale. | **Modifier** |
| `components/EmailValidatedModal.tsx` | Modale Option B : titre « Email validé », message, formulaire (email, mot de passe, bouton Se connecter). Utilise `Modal`, `Input`, `Button`, action `login`. Gestion erreur et loading. | **Créer** |
| `app/[locale]/login/actions.ts` | S’assurer que la redirection après `login()` préserve la locale (redirect vers `/[locale]/dashboard` selon `getLocale()`). | **Modifier** (si nécessaire) |
| `app/[locale]/login/page.tsx` ou composant associé | Lire `searchParams.error=confirmation_failed` et afficher le message d’erreur (lien invalide/expiré). | **Modifier** (léger) |
| `messages/fr.json` | Clés `auth.emailValidatedTitle`, `auth.emailValidatedMessage`. | **Modifier** |
| `messages/en.json` | Idem (traductions EN). | **Modifier** |

---

## 5. Détail des modifications

### 5.1 `app/auth/callback/route.ts`

- **Succès** (`code` présent et `exchangeCodeForSession` sans erreur) :
  - Utiliser le retour : `const { data, error } = await supabase.auth.exchangeCodeForSession(code)`.
  - Récupérer la locale : `const locale = data?.user?.user_metadata?.locale === 'en' ? 'en' : 'fr'`.
  - Rediriger vers : `origin + (locale === 'en' ? '/en' : '/') + '?emailConfirmed=1'`. Ex. `https://site.com/?emailConfirmed=1` (FR) ou `https://site.com/en?emailConfirmed=1` (EN).
- **Erreur** (pas de `code`, ou `exchangeCodeForSession` en erreur) :
  - Déduire la locale : en-tête `Accept-Language` (préférer `en` si présent) ou défaut `fr`.
  - Rediriger vers : `/${localePrefix}/login?error=confirmation_failed` (avec `localePrefix` = `locale === 'en' ? 'en' : ''` pour coller au routing next-intl).

Référence : US1.

### 5.2 Page d’accueil `app/[locale]/page.tsx`

- La page est un **Server Component**. Elle reçoit `searchParams` (Promise dans Next.js 15).
- Logique :
  1. Si `searchParams.emailConfirmed === '1'` (ou équivalent) :
     - Vérifier si l’utilisateur est authentifié (ex. `getCurrentUserWithProfile()` ou équivalent depuis `lib/authHelpers.ts`). Si **oui** : `redirect(`/${locale}/dashboard`)` (ou équivalent selon la convention du projet).
     - Si **non** authentifié : afficher le contenu normal de la page **et** un composant client qui reçoit une prop du type `showEmailConfirmedModal={true}`.
  2. Sinon : afficher la page comme aujourd’hui (pas de modale).
- Le composant client (voir § 5.3) doit être rendu à l’intérieur de la page (par ex. en bas du layout ou près des `AuthButtons`) et recevoir la prop dérivée de `searchParams.emailConfirmed` et de l’absence de session.

Référence : US2.

### 5.3 Composant `EmailValidatedModal`

- **Client Component** (`'use client'`).
- **Props** : `isOpen: boolean`, `onClose: () => void`.
- **Structure** :
  - Utiliser `Modal` (design system), **size="md"**, avec titre et icône de succès (check vert forêt) dans le header, bouton fermer (X). Fermeture par overlay et Escape (comportement par défaut de `Modal`).
  - **Corps** : message i18n « Vous pouvez vous connecter » ; puis champs **Email** et **Mot de passe** (composants `Input`), puis bouton **Se connecter** (variant `primary` ou `primaryDark`). Pas d’onglet inscription, pas de lien « Mot de passe oublié » obligatoire (optionnel si le design le permet).
  - **Formulaire** : `action` = `login` (depuis `app/[locale]/login/actions`). Utiliser `useActionState(login, initialState)` pour afficher l’erreur dans la modale et gérer le loading (bouton désactivé ou `loading` pendant la soumission). En cas de succès, l’action fait `redirect()`, donc la modale disparaît.
- **i18n** : `useTranslations('auth')` pour le titre, le message, les labels, le bouton. `useTranslations('common')` pour l’aria-label du bouton fermer si nécessaire.
- **Redirect après login** : l’action `login` existante doit rediriger vers le dashboard **dans la locale courante** (voir § 5.4). Aucun changement dans le composant si l’action gère déjà cela.

Référence : US2, US3, US4 ; mockup Option B.

### 5.4 Action `login` dans `app/[locale]/login/actions.ts`

- Après connexion réussie, la redirection doit aller vers le dashboard **dans la même locale** que la page d’où provient le formulaire (page login ou page d’accueil avec modale).
- Vérifier si actuellement `redirect(redirectPath)` utilise `redirectPath = '/dashboard'` sans préfixe de locale. Avec `localePrefix: 'as-needed'`, pour une requête effectuée depuis `/en/`, il faut rediriger vers `/en/dashboard`.
- **Modification proposée** : après une connexion réussie, calculer `redirectPath` ainsi :  
  `const locale = await getLocale()` ;  
  `redirectPath = locale === 'en' ? '/en/dashboard' : '/dashboard'`  
  (en conservant la logique existante si un paramètre `redirect` valide est présent dans le referer).

Référence : US3.

### 5.5 Page login – erreur callback

- Lorsque l’URL contient `?error=confirmation_failed`, afficher un message d’erreur en haut du formulaire (ou dans une alerte), en utilisant une clé i18n existante ou dédiée, par ex. `auth.invalidOrExpiredLink` ou `auth.errors.confirmationLinkFailed`.
- Si une clé dédiée est ajoutée (ex. `auth.errors.confirmationLinkFailed`), l’ajouter dans `messages/fr.json` et `messages/en.json`.

Référence : décision § 2 (erreur callback).

### 5.6 i18n

- **Namespace** : `auth`.
- **Nouvelles clés** (à ajouter dans `auth`, pas dans `auth.errors`) :

| Clé | FR | EN |
|-----|----|----|
| `emailValidatedTitle` | Email validé | Email verified |
| `emailValidatedMessage` | Vous pouvez vous connecter. | You can now log in. |

- Les libellés du formulaire (Email, Mot de passe, Se connecter) réutilisent les clés existantes : `auth.email`, `auth.password`, `auth.login`.
- Bouton fermer : réutiliser `common.close` pour l’aria-label.
- Référence : US4.

---

## 6. Flux résumés

1. **Clic « Confirmer mon email »** → requête vers Supabase → redirection vers `https://site/auth/callback?code=...&type=signup` (ou équivalent).
2. **Callback** : `exchangeCodeForSession(code)`. Succès → redirect `/[locale]/?emailConfirmed=1` (locale depuis `user_metadata`). Échec → redirect `/[locale]/login?error=confirmation_failed`.
3. **Page d’accueil** avec `?emailConfirmed=1` : si session présente → redirect dashboard. Sinon → affichage de la page + ouverture automatique de la modale « Email validé » avec formulaire.
4. **Utilisateur soumet le formulaire** dans la modale : action `login` ; succès → redirect dashboard (même locale) ; erreur → message dans la modale, pas de redirection.
5. **Page login** avec `?error=confirmation_failed` : affichage du message « Lien invalide ou expiré » (ou équivalent).

---

## 7. Tests manuels recommandés

- Inscription avec confirmation email activée → clic sur le lien dans l’email → vérifier arrivée sur la page d’accueil avec modale (et pas de session si Supabase ne crée pas la session avant le clic), ou arrivée sur le dashboard si session déjà créée.
- Connexion depuis la modale avec bons identifiants → redirection vers le dashboard dans la bonne locale.
- Connexion depuis la modale avec mauvais identifiants → message d’erreur dans la modale, pas de redirection.
- Ouvrir manuellement `/?emailConfirmed=1` (sans session) → modale s’ouvre.
- Ouvrir `/?emailConfirmed=1` en étant déjà connecté → redirection vers le dashboard.
- Simuler une erreur callback (lien expiré ou URL sans code) → redirection vers `/login?error=confirmation_failed` (ou `/en/login?error=confirmation_failed`) et affichage du message d’erreur.
- Vérifier les deux langues (FR/EN) pour la modale et le message d’erreur login.

---

## 8. Points à trancher en implémentation

- **Récupération de la locale dans le callback** : s’assurer que `exchangeCodeForSession` retourne bien l’objet utilisateur avec `user_metadata` (ou équivalent) pour en déduire la locale. Sinon, utiliser uniquement Accept-Language ou un défaut.
- **Compatibilité Next.js 15** : `searchParams` peut être une Promise ; utiliser `await searchParams` si nécessaire dans la page d’accueil.
- **Optionnel** : lien « Mot de passe oublié » dans la modale Email validé (non demandé dans les US ; à ajouter seulement si le PO le souhaite).

---

**Fin de la spec.** Le développeur peut implémenter à partir de cette spec et des user stories.
