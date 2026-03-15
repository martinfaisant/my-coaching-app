# User Stories — Menu dashboard en haut (top bar)

**Mode :** Designer  
**Date :** 12 mars 2026  
**Référence mockup :** `MOCKUP_CALENDAR_PAGE.html` (page Calendrier en mobile, tablette, ordinateur + bloc Drawer)

**Design system :** `docs/DESIGN_SYSTEM.md` — tokens (palette-forest-dark, stone, palette-danger), `Button`, `AvatarImage`, `Modal` (ou composant Drawer à créer/documenter).  
**i18n :** namespace `navigation` (libellés existants de la sidebar à réutiliser).

---

## US1 — Layout dashboard : barre en haut à la place de la sidebar

**En tant qu’**utilisateur connecté au dashboard,  
**je veux** que la navigation soit en barre horizontale en haut de la page,  
**afin de** voir le contenu en pleine largeur sous la barre.

**Critères d’acceptation :**
- Le layout du dashboard n’affiche plus la sidebar à gauche.
- Une barre horizontale (top bar) est affichée en haut sur toute la largeur.
- Le contenu des pages (ex. Calendrier) s’affiche sous la barre, dans la même zone scrollable qu’aujourd’hui.
- Le bouton flottant « Discuter » (chat) reste visible et fonctionnel.

**Référence mockup :** Toutes les vues (Mobile, Tablette, Ordinateur) — structure générale de la page avec la barre en haut.

**Composants :** Modifier `app/[locale]/dashboard/layout.tsx` (remplacer Sidebar par la top bar, layout en colonne). Nouveau composant barre : à créer (voir US2).

---

## US2 — Logo My Sport Ally à gauche

**En tant qu’**utilisateur du dashboard,  
**je veux** voir le logo My Sport Ally à gauche de la barre sur tous les écrans,  
**afin de** revenir facilement au dashboard en cliquant dessus.

**Critères d’acceptation :**
- Le logo (image + texte « My Sport Ally » si la place le permet) est affiché à gauche de la top bar.
- Comportement identique sur mobile, tablette et ordinateur.
- Clic sur le logo → navigation vers `/dashboard` (ou page d’accueil rôle).
- Sur très petite largeur, le texte peut être tronqué (ellipse) pour ne pas chevaucher la zone centrale.

**Référence mockup :** Zone « Logo » à gauche dans les trois blocs (Mobile, Tablette, Ordinateur) de `MOCKUP_CALENDAR_PAGE.html`.

**Composants :** Réutiliser le logo existant (lien + image comme dans Sidebar). Design system : pas de nouveau composant.

---

## US3 — Navigation tablette et ordinateur : liens visibles, centrage et scroll

**En tant qu’**utilisateur sur tablette ou ordinateur,  
**je veux** accéder aux pages du dashboard via des liens visibles dans la barre (sans ouvrir de menu),  
**afin de** naviguer rapidement.

**Critères d’acceptation :**
- **Ordinateur :** les liens de navigation (Calendrier, Objectifs, Appareils, etc. selon le rôle) sont affichés au centre de la barre ; le lien de la page courante est mis en évidence (style actif : fond vert forêt, texte blanc).
- **Tablette :** les mêmes liens sont affichés dans la zone centrale ; si l’espace est insuffisant, la zone est scrollable horizontalement (doigt ou souris), **sans afficher de barre de défilement**.
- Aucun chevauchement entre le logo à gauche et les liens ; le bloc profil à droite reste visible.
- Les liens affichés dépendent du rôle (athlète / coach / admin) — même logique que la sidebar actuelle.

**Référence mockup :** Section « Tablette (ex. 768px) » et « Ordinateur (ex. 1280px) » — zone nav entre logo et profil. Récap : « Logo à gauche, liens nav au centre (centrés sur ordinateur), profil à droite » ; « scrollable sans scrollbar » en tablette.

**Composants :** Liens avec icônes (réutiliser ou extraire les icônes de Sidebar). Tokens : `bg-palette-forest-dark`, `text-white` pour l’état actif ; `text-stone-500`, `hover:bg-stone-50`, `hover:text-palette-forest-dark` pour inactif. Classe utilitaire ou style pour masquer la scrollbar (scrollbar-hide).

---

## US4 — Menu hamburger (mobile) et ouverture du drawer

**En tant qu’**utilisateur sur mobile,  
**je veux** ouvrir un menu (icône hamburger) pour accéder aux pages et à mon profil,  
**afin de** ne pas encombrer la barre avec tous les liens.

**Critères d’acceptation :**
- Sur mobile (breakpoint à définir, ex. &lt; 768px ou &lt; 1024px), la barre affiche : à gauche le logo, à droite un bouton hamburger (icône « trois barres »).
- Au clic sur le hamburger, un drawer (panneau coulissant ou overlay) s’ouvre.
- Le drawer affiche la liste des liens de navigation (mêmes libellés et icônes que la sidebar actuelle), avec la page courante mise en évidence.
- Le drawer peut être fermé par un clic en dehors, sur un bouton fermer, ou après une navigation (à préciser en implémentation).

**Référence mockup :** Section « Mobile (ex. 375px) » — barre avec logo à gauche, hamburger à droite. Section « Drawer menu (mobile — contenu du hamburger) » — liste des liens.

**Composants :** Bouton icône (hamburger), composant Drawer ou équivalent (à créer si absent du design system). Réutiliser la logique des liens par rôle depuis Sidebar.

---

## US5 — Contenu du drawer : Profil et Déconnexion

**En tant qu’**utilisateur mobile,  
**je veux** accéder à mon profil et me déconnecter depuis le menu (drawer),  
**afin de** ne pas avoir à chercher ces actions ailleurs.

**Critères d’acceptation :**
- En bas du drawer (sous la liste des liens), un bloc « Profil » : avatar + nom (ou email) + libellé « Profil » ; clic → navigation vers `/dashboard/profile`.
- Sous le bloc Profil, un séparateur puis un lien/bouton « Déconnexion » avec icône de déconnexion et style danger (couleur palette-danger, hover fond rouge clair).
- Clic sur Déconnexion → déconnexion (même comportement que le bouton actuel dans la sidebar/page profil).

**Référence mockup :** Bloc « Drawer menu » dans `MOCKUP_CALENDAR_PAGE.html` — zone « Profil (avatar + nom + lien Profil) » et « Déconnexion » (icône + texte, style rouge).

**Composants :** `AvatarImage`, `Button` ou lien stylisé. Tokens : `text-palette-danger`, `hover:bg-red-50` pour Déconnexion. i18n : `navigation` pour « Profil » si besoin ; libellé Déconnexion (ex. `auth.logout` ou existant).

---

## US6 — Icône dans les titres de page

**En tant qu’**utilisateur du dashboard,  
**je veux** voir une icône à côté du titre de chaque page (ex. calendrier pour la page Calendrier),  
**afin de** identifier rapidement la section.

**Critères d’acceptation :**
- Les pages dont le titre est affiché dans le header (ex. Calendrier, Objectifs, Appareils, Athlètes, Offres, etc.) affichent une icône à gauche du titre.
- L’icône est dans un badge/carré arrondi (ex. rounded-xl) de couleur vert forêt (bg-palette-forest-dark), icône blanche.
- Comportement cohérent sur mobile, tablette et ordinateur pour les pages concernées.

**Référence mockup :** Titre « Calendrier » avec icône calendrier (badge vert + icône) dans les trois vues (Mobile, Tablette, Ordinateur) de `MOCKUP_CALENDAR_PAGE.html`. Récap : « Titres de page : conserver une icône à côté du titre ».

**Composants :** Faire évoluer `PageHeader` pour accepter une prop `icon` optionnelle (ReactNode), ou adapter les headers custom (ex. `CalendarViewWithNavigation` pour Calendrier) pour afficher l’icône. Design system : style badge cohérent (rounded-xl, bg-palette-forest-dark, texte blanc).

---

## US7 — Liens de navigation selon le rôle (athlète / coach / admin)

**En tant qu’**athlète, coach ou admin,  
**je veux** ne voir que les liens pertinents pour mon rôle dans la barre (et dans le drawer sur mobile),  
**afin de** ne pas être encombré par des entrées inutiles.

**Critères d’acceptation :**
- **Athlète :** Trouver un coach (si pas de coach_id), Calendrier, Objectifs, Appareils, Mon coach (si coach_id), Historique abonnements, puis Profil/Déconnexion dans le drawer.
- **Coach :** Athlètes, Offres (si non admin), Souscriptions (si role === 'coach'), Design System (si admin), puis Profil/Déconnexion.
- **Admin :** Idem coach avec lien Design System.
- Le lien de la page courante est visuellement actif (fond vert forêt, texte blanc) dans la barre et dans le drawer.

**Référence mockup :** Contenu des listes de liens (section Tablette, Ordinateur, Drawer) — les libellés et le nombre d’entrées doivent refléter le rôle. Référence fonctionnelle : `components/Sidebar.tsx` (logique actuelle par rôle).

**Composants :** Réutiliser la logique et les clés i18n de la Sidebar (namespace `navigation`). Pas de nouveau composant métier.

---

## US8 — Bloc Profil dans la barre (tablette et ordinateur)

**En tant qu’**utilisateur sur tablette ou ordinateur,  
**je veux** voir mon profil (avatar + nom) à droite de la barre et cliquer pour aller sur la page profil,  
**afin d’**y accéder rapidement sans passer par le menu.

**Critères d’acceptation :**
- À droite de la barre (à droite de la zone des liens sur tablette/ordinateur), un bloc cliquable affiche l’avatar et le nom (ou email) de l’utilisateur.
- Clic sur ce bloc → navigation vers `/dashboard/profile`.
- Si le nom est long, il est tronqué avec ellipse ; l’avatar reste toujours visible.
- Ce bloc n’est pas affiché sur mobile (le profil est dans le drawer — US5).

**Référence mockup :** Zone « Profil » à droite dans les sections Tablette et Ordinateur (avatar JD + « Jean Dupont »).

**Composants :** `AvatarImage`, lien (Next.js Link / i18n). Style : bordure légère, fond stone-50, hover discret (comme dans le mockup). Réutiliser `getDisplayName` (ou équivalent) pour le libellé.

---

## Récapitulatif et checklist

| US  | Titre court                          | Référence mockup principale     |
|-----|--------------------------------------|---------------------------------|
| US1 | Layout : top bar à la place sidebar  | Toute la page (3 vues)          |
| US2 | Logo à gauche                        | Zone logo (3 vues)              |
| US3 | Nav tablette/ordinateur (centrée, scroll) | Tablette + Ordinateur      |
| US4 | Hamburger + drawer (mobile)          | Mobile + bloc Drawer             |
| US5 | Drawer : Profil + Déconnexion        | Bas du bloc Drawer              |
| US6 | Icône dans titres de page            | Titre « Calendrier » (3 vues)   |
| US7 | Liens selon rôle                    | Listes de liens (Sidebar actuelle) |
| US8 | Bloc Profil à droite (tablette/desktop) | Zone profil Tablette + Ordinateur |

**Checklist avant implémentation :**
- [ ] Design system consulté (tokens, Button, AvatarImage).
- [ ] Mockup `MOCKUP_CALENDAR_PAGE.html` validé visuellement.
- [ ] Chaque US liée à une zone du mockup ou à la Sidebar actuelle.
- [ ] Composants à créer : TopBar (ou DashboardTopBar), Drawer (si absent).
- [ ] Composants à faire évoluer : layout dashboard, PageHeader (ou headers custom) pour l’icône.
- [ ] i18n : namespace `navigation` pour les libellés des liens et Profil.
