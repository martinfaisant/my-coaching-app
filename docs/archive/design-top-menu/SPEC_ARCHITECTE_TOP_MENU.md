# Spec technique — Menu dashboard en haut (top bar)

**Mode :** Architecte  
**Date :** 12 mars 2026  
**Références :** `USER_STORIES_TOP_MENU.md`, `MOCKUP_CALENDAR_PAGE.html`, `DESIGN_TOP_MENU.md`

---

## 1. Contexte et contraintes

- **Menu dynamique selon le rôle et le profil :** les liens affichés ne sont pas les mêmes pour tous les utilisateurs. La logique actuelle de la Sidebar doit être conservée et réutilisée (athlète avec/sans coach_id, coach vs admin, etc.).
- Aucun changement de modèle de données ni de RLS : affichage uniquement côté client à partir du `profile` déjà chargé dans le layout.
- Le layout dashboard reste serveur : il récupère `getCurrentUserWithProfile()` et passe le profil au composant de barre (client).

---

## 2. Architecture et flux

### 2.1 Vue d’ensemble

- **Layout dashboard** (serveur) : appelle `getCurrentUserWithProfile()`, ne rend plus la `Sidebar`, rend une **top bar** (composant client) + le même `DashboardChatWrapper` avec `children`. Structure : colonne (flex-col) : barre en haut, puis zone contenu (flex-1 min-w-0) contenant les children.
- **Top bar** (client) : reçoit `profile` (+ email). Affiche selon le breakpoint :
  - **Mobile** (< breakpoint, ex. 768px) : logo à gauche, bouton hamburger à droite. Au clic hamburger : ouverture d’un **Drawer** dont le contenu est la liste des liens (calculée selon rôle/profile) + bloc Profil + Déconnexion.
  - **Tablette / Desktop** (≥ breakpoint) : logo à gauche, **liste de liens** au centre (scrollable sans scrollbar en tablette, centrée sur desktop), bloc **Profil** à droite.
- **Liste de liens** : dérivée d’une **configuration centralisée** (voir § Logique métier) pour éviter la duplication entre barre et drawer et garantir que le menu reste dynamique (un seul endroit de vérité pour « quels liens pour quel rôle »).

### 2.2 Flux de données

1. `DashboardLayout` (server) → `getCurrentUserWithProfile()` → `profile` + `email` + `id`.
2. Même layout rend `<DashboardTopBar profile={...} />` + `<DashboardChatWrapper>{children}</DashboardChatWrapper>`.
3. `DashboardTopBar` (client) : `usePathname()` pour la page courante, `useTranslations('navigation')` pour les libellés. Calcule la liste des liens à afficher via une fonction ou un hook basé sur `profile` (role, coach_id).
4. Drawer (état local `open`) reçoit la même liste de liens + callbacks (fermer après navigation, déconnexion).

### 2.3 Fichiers et rôles

| Fichier | Rôle | Action |
|---------|------|--------|
| `app/[locale]/dashboard/layout.tsx` | Layout dashboard | **Modifier** : remplacer Sidebar par DashboardTopBar, layout en colonne (barre + zone contenu). |
| `components/DashboardTopBar.tsx` | Barre horizontale (logo, nav ou hamburger, profil) | **Créer** : client, reçoit profile, breakpoint, rend logo + nav ou hamburger + profil (desktop/tablette). |
| `components/DashboardNavLinks.tsx` | Liste de liens (réutilisable barre + drawer) | **Créer** : client, reçoit items (config), pathname, variant (inline / list), rend liens avec icônes et style actif. |
| `lib/dashboardNavConfig.ts` | Configuration des liens par rôle (source de vérité) | **Créer** : pur (pas de React). Exporte une fonction `getDashboardNavItems(profile)` → tableau d’items { href, i18nKey, icon?, match }. |
| `components/Drawer.tsx` | Panneau coulissant / overlay (mobile) | **Créer** : client, isOpen, onClose, children, position (left/right), optional title. Pas de dépendance métier. |
| `components/Sidebar.tsx` | Ancienne sidebar | **Supprimer** ou **archiver** : plus rendue par le layout. La logique des liens est migrée vers `dashboardNavConfig` + `DashboardNavLinks`. |
| `components/PageHeader.tsx` | En-tête des pages (titre + rightContent) | **Modifier** : ajouter prop optionnelle `icon?: ReactNode` affichée à gauche du titre (badge rounded-xl bg-palette-forest-dark). |
| Pages utilisant un header custom (ex. Calendrier) | Titre + sélecteur | **Modifier** si besoin : passer une icône au header (ex. `CalendarViewWithNavigation` / `AthleteCalendarPage`). |
| `components/LogoutButton.tsx` | Déconnexion | **Tels quels** : réutilisé dans le drawer (éventuellement variante « lien » pour le drawer). |
| `components/AvatarImage.tsx` | Avatar | **Tels quels**. |
| `docs/DESIGN_SYSTEM.md` | Design system | **Mettre à jour** : documenter Drawer, DashboardTopBar (ou lien depuis la spec), PageHeader (prop icon). |

---

## 3. Modèle de données

**Aucun changement en base.** Le menu s’appuie uniquement sur :

- `profile` déjà chargé (role, coach_id, first_name, last_name, avatar_url, email) ;
- `pathname` (client) pour l’état actif.

Pas de nouvelle table, pas de migration, pas de RLS à modifier.

---

## 4. Logique métier : menu dynamique (config centralisée)

### 4.1 Règle : une seule source de vérité pour les liens

Les liens affichés dans la top bar (desktop/tablette) et dans le drawer (mobile) doivent être **identiques** et dérivés d’une **configuration par rôle**. On évite de dupliquer les conditions `profile.role`, `profile.coach_id`, etc. dans plusieurs composants.

### 4.2 Proposition : `lib/dashboardNavConfig.ts`

- **Entrée :** `profile: { role: string, coach_id?: string | null }` (au minimum).
- **Sortie :** tableau d’items ordonnés, par ex. `{ href: string, i18nKey: string, exact?: boolean }[]`.

Exemple de structure (à adapter aux clés i18n existantes) :

```ts
// Exemple de forme (à implémenter)
type NavItem = { href: string; i18nKey: string; exact?: boolean }

function getDashboardNavItems(profile: { role: string; coach_id?: string | null }): NavItem[] {
  if (profile.role === 'athlete') {
    const items: NavItem[] = []
    if (!profile.coach_id) items.push({ href: '/dashboard/find-coach', i18nKey: 'findCoach' })
    items.push({ href: '/dashboard/calendar', i18nKey: 'calendar' })
    items.push({ href: '/dashboard/objectifs', i18nKey: 'goals' })
    items.push({ href: '/dashboard/devices', i18nKey: 'devices' })
    if (profile.coach_id) items.push({ href: '/dashboard/coach', i18nKey: 'myCoach' })
    items.push({ href: '/dashboard/subscriptions/history', i18nKey: 'subscriptionHistory' })
    return items
  }
  if (profile.role === 'coach' || profile.role === 'admin') {
    const items: NavItem[] = [
      { href: '/dashboard/athletes', i18nKey: 'athletes', exact: false },
      ...(profile.role !== 'admin' ? [{ href: '/dashboard/profile/offers', i18nKey: 'offers' }] : []),
      ...(profile.role === 'coach' ? [{ href: '/dashboard/subscriptions', i18nKey: 'subscriptions' }] : []),
    ]
    if (profile.role === 'admin') {
      items.push({ href: '/dashboard/admin/design-system', i18nKey: 'designSystem' }) // ou clé dédiée
    }
    return items
  }
  return []
}
```

- **Correspondance avec la page courante :** pour chaque item, actif si `pathname === href` ou (si `exact === false`) `pathname.startsWith(href)`. À utiliser dans `DashboardTopBar` et dans le contenu du Drawer.
- **Icônes :** peuvent être mappées dans le même fichier (ex. par `href` ou `i18nKey`) ou dans un composant qui rend un lien (ex. `DashboardNavLinks`) pour garder les SVG au même endroit que la Sidebar actuelle (extraction depuis Sidebar ou fichier d’icônes partagé).

### 4.3 Cas à couvrir (récap)

| Profil | Liens (ordre) |
|--------|----------------|
| Athlète sans coach | findCoach, calendar, goals, devices, subscriptionHistory |
| Athlète avec coach | calendar, goals, devices, myCoach, subscriptionHistory |
| Coach | athletes, offers, subscriptions |
| Admin | athletes, design-system (pas offers ni subscriptions côté nav actuelle Sidebar) |

Vérifier dans `Sidebar.tsx` les conditions exactes (ex. `profile.role !== 'admin'` pour Offres, `profile.role === 'coach'` pour Souscriptions) et les reproduire dans `getDashboardNavItems`.

---

## 5. RLS et sécurité

- **Aucune modification RLS** : pas d’accès données supplémentaires pour le menu.
- Les **routes** restent protégées comme aujourd’hui (middleware / redirections par rôle). La top bar n’autorise pas l’accès : elle affiche seulement les liens ; la vérification côté serveur reste sur chaque page.

---

## 6. Composants détaillés

### 6.1 DashboardTopBar

- **Props :** `profile: Profile & { email: string }` (même type que Sidebar).
- **Client :** `'use client'`, `usePathname`, `useTranslations('navigation')`, état `drawerOpen` pour le hamburger.
- **Comportement :**
  - Logo à gauche (lien vers `/dashboard`), même visuel que Sidebar (Image logo + texte « My Sport Ally » avec truncate si besoin).
  - Breakpoint (ex. `md` 768px ou `lg` 1024px) : en dessous → afficher bouton hamburger à droite ; au-dessus → afficher `DashboardNavLinks` (liste d’items issue de `getDashboardNavItems(profile)`) au centre + bloc Profil à droite.
  - Nav centrale : sur desktop, `justify-center` ; sur tablette, scroll horizontal avec classe `scrollbar-hide` (voir mockup). Pas de chevauchement logo / nav (min-w-0, overflow-x-auto sur la nav).
  - Bloc Profil (desktop/tablette uniquement) : lien vers `/dashboard/profile`, AvatarImage + getDisplayName(profile), tronqué si long.
  - Drawer : rendu conditionnel (mobile), contenu = `DashboardNavLinks` (variant list) + bloc Profil (avatar + nom + lien Profil) + LogoutButton (ou lien Déconnexion avec icône). Fermeture : onClose au clic overlay ou après navigation (à trancher en implémentation).

### 6.2 DashboardNavLinks

- **Props :** `items: NavItem[]`, `pathname: string`, `variant: 'inline' | 'list'` (inline = barre horizontale, list = drawer vertical).
- Affiche pour chaque item : icône + libellé (t(key)), lien actif = style vert forêt (bg-palette-forest-dark text-white), sinon stone + hover. Utilise `Link` (i18n) et même logique de match que Sidebar (exact vs startsWith).

### 6.3 Drawer

- **Props :** `isOpen: boolean`, `onClose: () => void`, `children: ReactNode`, `placement?: 'left' | 'right'`, optionnel `title` ou `aria-label`.
- Comportement : overlay (backdrop), panneau qui slide depuis la gauche (ou droite). Fermeture au clic overlay et Escape. Accessibilité : focus trap et aria. Pas de logique métier dashboard : composant réutilisable.

### 6.4 PageHeader (évolution)

- **Changement :** ajouter `icon?: ReactNode`. Si fourni, afficher à gauche du titre un conteneur (ex. `rounded-xl bg-palette-forest-dark text-white` avec padding) contenant `icon`. Sinon, comportement actuel inchangé.

---

## 7. i18n

- **Namespace `navigation`** : déjà utilisé (findCoach, calendar, goals, myCoach, devices, athletes, offers, subscriptions, subscriptionHistory, profile, openMenu, collapseMenu). Réutiliser pour les libellés des liens.
- **Déconnexion :** `auth.logout` (existant). Pour le drawer, même clé.
- **Design System (admin) :** si une clé dédiée n’existe pas dans `navigation`, ajouter une entrée (ex. `designSystem`) dans `messages/fr.json` et `messages/en.json` pour cohérence.
- **Aria / labels :** `navigation.openMenu` pour le bouton hamburger, éventuellement `navigation.collapseMenu` pour fermer le drawer.

---

## 8. Tests manuels recommandés

1. **Rôles :** se connecter en athlète sans coach → vérifier findCoach, calendar, goals, devices, subscriptionHistory (pas myCoach). Puis athlète avec coach → myCoach présent, findCoach absent.
2. **Coach :** vérifier athletes, offers, subscriptions. **Admin :** vérifier athletes, design-system ; pas d’offres ni souscriptions dans le menu.
3. **Responsive :** mobile → logo + hamburger, ouverture drawer avec tous les liens + Profil + Déconnexion. Tablette → logo + nav scrollable (sans scrollbar visible) + profil. Desktop → nav centrée, pas de chevauchement.
4. **Navigation :** clic sur chaque lien (barre et drawer) → bonne page ; lien actif surligné (vert).
5. **Profil et déconnexion :** clic Profil (barre ou drawer) → page profil. Déconnexion dans le drawer → déconnexion effective et redirection.
6. **Pages avec titre :** Calendrier, Objectifs, etc. affichent bien une icône à côté du titre si PageHeader (ou header custom) reçoit l’icône.
7. **Chat :** le bouton flottant « Discuter » reste visible et fonctionnel après passage à la top bar.

---

## 9. Points à trancher en implémentation

- **Breakpoint mobile / desktop :** 768px (md) ou 1024px (lg) pour basculer entre hamburger et barre avec liens visibles. À aligner avec le mockup et le reste de l’app.
- **Fermeture du drawer :** fermer automatiquement après un clic sur un lien (navigation) ou laisser ouvert jusqu’à clic overlay/fermeture explicite.
- **Design System (admin) :** libellé exact dans la config (clé i18n « Design System » ou « designSystem ») et présence dans `navigation` si pas déjà.
- **Icônes :** extraire les SVG de la Sidebar dans un module partagé (ex. `components/DashboardNavIcons.tsx` ou par href dans `dashboardNavConfig`) pour éviter duplication.
- **Sidebar :** suppression complète du fichier après migration, ou conservation en archive (ex. renommage en `Sidebar.legacy.tsx`) pour référence ; à valider avec le PO.

---

## 10. Checklist spec

- [ ] Architecture et flux décrits (layout, top bar, drawer, config des liens).
- [ ] Table des fichiers : Créer / Modifier / Supprimer listés.
- [ ] Aucun changement BDD ni RLS.
- [ ] Logique métier du **menu dynamique** centralisée dans `getDashboardNavItems(profile)` avec tous les cas (athlète avec/sans coach, coach, admin).
- [ ] Tests manuels recommandés listés.
- [ ] Points à trancher en implémentation listés.
