# Design — Menu dashboard en haut (top bar)

**Mode :** Designer  
**Date :** 12 mars 2026

---

## 1. Besoin reformulé

Le PO souhaite une **navigation du dashboard en barre horizontale en haut de la page**, à la place de la **sidebar verticale à gauche** actuelle. L’objectif est d’avoir un menu « en haut » plutôt que « sur le côté ».

---

## 2. Structure actuelle (rappel)

- **Layout dashboard** (`app/[locale]/dashboard/layout.tsx`) : conteneur flex horizontal avec `Sidebar` à gauche et le contenu (children + `DashboardChatWrapper`) à droite.
- **Sidebar** (`components/Sidebar.tsx`) : bande verticale (réductible sur desktop) avec :
  - Logo My Sport Ally en haut ;
  - Liens de navigation selon le rôle (athlète : Trouver un coach, Calendrier, Objectifs, Appareils, Mon coach, Historique abo ; coach : Athlètes, Offres, Souscriptions ; admin : + Design System) ;
  - Bloc Profil (avatar + nom) en bas.
- **Contenu** : `DashboardPageShell` (titre + zone scrollable) dans une carte blanche à droite.

---

## 3. Cas à couvrir

| Cas | Description |
|-----|-------------|
| **Nominal** | Affichage du menu en haut, tous les liens accessibles, profil/déconnexion accessibles. |
| **Rôles** | Liens différents selon athlète / coach / admin (déjà géré côté sidebar). |
| **Desktop** | Barre pleine largeur avec logo, liens, profil. |
| **Mobile** | Peu de largeur : soit barre scrollable avec icônes, soit menu hamburger + drawer. |
| **Cohérence** | Le bouton flottant « Discuter » (chat) et le contenu des pages restent inchangés (DashboardPageShell, zone scrollable). |

---

## 4. Questions au PO (clarification)

1. **Mobile :** Préférence pour un **menu hamburger** qui ouvre un tiroir (drawer) avec la liste des liens, ou une **barre horizontale scrollable** avec icônes (ou icône + court libellé) ?
2. **Profil :** Souhaitez-vous que le bloc « Profil » (avatar + nom) reste **toujours visible** dans la barre (Solution A), ou qu’il soit dans un **menu déroulant** au clic sur l’avatar (Solution B) pour gagner de la place ?
3. **Logo :** Conserver **logo à gauche** et liens à droite/centre, ou autre disposition (ex. logo centré) ?

---

## 5. Propositions (mockups)

Trois solutions sont proposées dans **`MOCKUP_TOP_MENU.html`** (mockups HTML non fonctionnels, tokens design system) :

- **Solution A — Barre unique, tous les liens visibles**  
  Logo à gauche, liens au centre, profil (avatar + nom) à droite. Simple, lisible sur desktop ; sur mobile les liens peuvent passer en scroll horizontal ou être regroupés.

- **Solution B — Profil en menu déroulant**  
  Même barre, mais à droite un seul bouton « Profil » (avatar + chevron) ouvrant un dropdown : Profil, Historique abonnements (athlète), Déconnexion. Libère de la place pour les liens.

- **Solution C — Mobile : hamburger + drawer**  
  Sur petit écran : logo + un lien prioritaire (ex. Calendrier) + icône hamburger ; clic = ouverture d’un drawer avec la liste complète des liens + profil en bas (équivalent visuel de la sidebar actuelle).

Combinaison possible : **A ou B pour desktop**, **C pour mobile**.

---

## 6. Composants à utiliser / faire évoluer

| Composant | Action |
|-----------|--------|
| **DashboardTopBar** (ou **TopNav**) | **À créer.** Barre fixe en haut : logo, navigation (liens selon rôle), zone profil (lien direct ou dropdown). |
| **AvatarImage**, **Button** | **Tels quels.** |
| **Dropdown** (design system) | **Tels quels** pour le menu profil (Solution B). |
| **PageHeader**, **DashboardPageShell** | **Tels quels.** Pas de changement de structure des pages. |
| **Layout dashboard** | **À modifier.** Remplacer la Sidebar par la TopBar ; layout en colonne (barre en haut, contenu en dessous). |
| **Sidebar** | **À retirer** du layout desktop ; optionnellement **réutiliser** le contenu (liste de liens) dans le drawer mobile (Solution C). |
| **Drawer** | **À créer ou documenter** si absent du design system (pour Solution C mobile). |

---

## 7. Références

- Design system : `docs/DESIGN_SYSTEM.md` (tokens, Button, Dropdown, PublicHeader).
- Layout actuel : `app/[locale]/dashboard/layout.tsx`, `components/Sidebar.tsx`.
- i18n : namespace `navigation` (déjà utilisé pour les libellés de la sidebar).

---

## 8. Compléments — Réponses PO et mockup page Calendrier

**Choix du PO :**
- **Mobile :** menu **hamburger** (drawer avec liste des liens).
- **Profil sur mobile :** le **profil va dans le hamburger menu** (avatar + nom + lien Profil + Déconnexion dans le drawer).
- **Logo :** **logo à gauche** sur tous les breakpoints ; **hamburger à droite** sur mobile.
- **Titres de page :** **garder les icônes dans les titres** (ex. icône calendrier à côté de « Calendrier »).

**Mockup de référence :** **`MOCKUP_CALENDAR_PAGE.html`** — exemples de la **page Calendrier** sur **mobile (375px), tablette (768px) et ordinateur** avec top bar (logo à gauche, hamburger à droite sur mobile ; logo à gauche, nav au centre, profil à droite sur tablette/desktop), titre de page avec icône calendrier, sélecteur de semaine, grille et tuiles entraînement. Un bloc montre aussi le **contenu du drawer mobile** (liens + Profil + Déconnexion).

Une fois une solution validée (A, B et/ou C), **Découpage :** **`USER_STORIES_TOP_MENU.md`** (8 US).  
**Spec technique :** **`SPEC_ARCHITECTE_TOP_MENU.md`** (architecture, table des fichiers, menu dynamique centralisé, pas de BDD/RLS, tests manuels, points à trancher). avec critères d’acceptation et référence au mockup.
