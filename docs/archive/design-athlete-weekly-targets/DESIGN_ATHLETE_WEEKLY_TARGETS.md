# Design — Profil athlète : temps alloué et volume actuel par sport/semaine

**Mode :** Designer  
**Date :** 12 mars 2026

---

## 1. Besoin reformulé

Dans le **profil de l’athlète** (page « Mon profil » lorsque l’utilisateur est athlète), ajouter une **section dédiée** qui affiche, **pour chaque sport pratiqué** (sports sélectionnés dans « Sports pratiqués ») :

1. **Temps à allouer par semaine (global)** — **une seule valeur** pour toute la semaine (tous sports confondus) : objectif / cible que l’athlète souhaite consacrer au sport chaque semaine (saisie manuelle).
2. **Volume actuel par sport et par semaine** — pour chaque sport pratiqué, volume actuellement réalisé ; **saisie manuelle** par l’athlète (pas de calcul automatique). Unités : km (course, vélo), m (natation), h (musculation uniquement).

L’objectif est de donner à l’athlète (et éventuellement au coach) une vision claire : objectif hebdo **global** vs volume actuel **par sport**.

---

## 2. Structure actuelle du profil athlète

- **Page :** `app/[locale]/dashboard/profile/page.tsx` — affiche `ProfileForm` dans un `DashboardPageShell` (titre « Mon profil », bouton Déconnexion à droite).
- **Formulaire athlète** (`ProfileForm.tsx`, lorsque `role === 'athlete'`) :
  - Bannière dégradé + avatar (modifiable).
  - Bloc **Mes informations** : Prénom, Nom, Email (lecture seule), Code postal.
  - **Sports pratiqués** : tuiles sélectionnables (`SportTileSelectable`) — même liste que dans `lib/sportStyles.ts` (course, vélo, natation, musculation, trail, randonnée, triathlon, ski, etc.).
  - Pas de section Langues ni Présentation (réservées au coach).
  - Zone danger (Supprimer le compte) en bas.

Il n’existe pas aujourd’hui de section « objectifs / volume par sport » dans le profil. Pour cette feature, le **volume actuel** est **saisi manuellement** par l’athlète (pas de lien avec le calcul calendrier).

---

## 3. Cas à couvrir

| Cas | Description |
|-----|-------------|
| **Nominal** | L’athlète a au moins un sport pratiqué ; la section affiche **un champ global « Temps à allouer par semaine »** (une valeur pour toute la semaine) et un **tableau Volume actuel** (une ligne par sport, saisie manuelle). |
| **Aucun sport** | Si l’athlète n’a sélectionné aucun sport pratiqué : soit la section est masquée, soit affichée vide avec un message du type « Sélectionnez des sports pratiqués ci-dessus pour définir vos objectifs. » |
| **Saisie** | « Temps à allouer » = **une seule valeur globale** (ex. 10 h/semaine). « Volume actuel » = **par sport**, saisi manuellement. Unités volume selon le sport (km, m, h). Validation (positif, plafond raisonnable). |
| **Enregistrement** | Le champ « temps à allouer (global) » et les champs « volume actuel » par sport font partie du formulaire profil : enregistrement avec le bouton « Enregistrer » existant (même pattern que les autres champs). |
| **Coach** | Le coach voit-il ces infos ? (ex. sur la fiche athlète `/dashboard/athletes/[athleteId]` ou ailleurs.) À clarifier. |

---

## 4. Décisions PO (validées)

- **Temps à allouer :** **global** — une seule valeur pour toute la semaine (tous sports confondus), saisie manuelle.
- **Ordre :** La section apparaît **juste après « Sports pratiqués »**.
- **Volume actuel — saisie manuelle** par l’athlète (pas de calcul automatique), **par sport**.
- **Volume actuel — unités par sport :**
  - **Course à pied** (course, course_route, trail, randonnée) : **km**.
  - **Vélo** : **km**.
  - **Natation** : **m** (mètres).
  - **Musculation** : **volume horaire uniquement** (temps en h), pas de distance.
  - Pour les autres sports (triathlon, ski, etc.) : à définir en implémentation si besoin (ex. triathlon = temps ou km).
- **Icônes sport :** **Toujours utiliser les icônes du site** — `components/SportIcons.tsx` via `lib/sportStyles.ts` (`SPORT_ICONS`). Ne pas utiliser d’emojis ni d’icônes externes. Voir aussi **`docs/DESIGN_SYSTEM.md`** (section Icônes / Guidelines).

### Réponses PO

- **Temps à allouer** : **en heures** (saisie en h, suffixe « h/sem. » ou « h/week »).
- **Visibilité coach** : **oui**, le coach verra ces infos pour chaque athlète ; l’affichage côté coach sera **traité à part** (hors scope de ce design).

---

## 5. Propositions UX (temps à allouer global) — sans tableau

Le **temps à allouer par semaine** est **global** (une seule valeur). Le **volume actuel** est **par sport** (saisie manuelle). La liste des sports affichés est **dynamique** (uniquement les sports sélectionnés dans « Sports pratiqués »). Les propositions ci-dessous évitent le tableau pour un rendu plus moderne et un meilleur usage de l’espace.

### Solution D — Lignes compactes (liste dynamique)

- **Temps global** : une seule ligne (label « Temps à allouer par semaine » + input inline ou à droite), style barre légère (fond stone-50, padding réduit).
- **Volume par sport** : une **liste verticale** — pour chaque sport pratiqué, **une ligne** avec [icône sport] [nom] [input volume] sur la même ligne (flex). Lignes séparées par une bordure fine ou fond alterné. Pas de tableau : simple `map` sur la liste des sports sélectionnés.
- **Avantage :** dynamique par nature, compact, lisible. S’adapte à 1 ou 10 sports sans changer de structure.

### Solution E — Cartes sport compactes (grille) — **retenue**

- **Temps global** : **titre et champ sur la même ligne** (ex. « Temps à allouer / semaine » à gauche, input à droite). L’input affiche **en permanence** un suffixe d’unité : **« /sem. »** (FR) ou **« /week »** (EN), selon la locale — même pattern que le champ prix dans `OffersForm.tsx` (wrapper `relative`, input avec `pr-*` pour laisser la place, `<span>` en position absolue à droite, `pointer-events-none`).
- **Volume par sport** : **grille de petites cartes** (2 colonnes desktop, 1 sur mobile). Dans chaque carte : **titre (icône + nom du sport) et champ de saisie sur la même ligne** ; le champ affiche **toujours** un suffixe selon le sport et la locale : ex. « km /sem. » ou « km /week », « m /sem. », « h /sem. ». Réutiliser le **même pattern input avec suffixe** que sur le site (OffersForm : input + span absolu pour « € »).
- **Composant existant :** le site utilise déjà un champ avec suffixe fixe (formulaire offres : prix + « € »). Même approche : conteneur `relative`, input avec padding-right pour le suffixe, span en `absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none` pour afficher « /sem. » ou « /week » (et éventuellement l’unité métrique : km, m, h).
- **Avantage :** visuel moderne, compact (titre + champ sur une ligne), unité toujours visible ; grille dynamique selon les sports pratiqués.

### Solution F — Bloc formulaire type « paramètres »

- **Une seule carte** avec titre « Objectifs et volume par sport ».
- **Premier champ** : « Temps à allouer par semaine (total) » [input], style Input classique.
- **En dessous** : sous-titre discret « Volume actuel par sport », puis une **série de champs** — chaque champ = label (icône + nom du sport) à gauche, input à droite, sur une ligne. Espacement vertical réduit entre les champs. Liste rendue par `map` sur les sports pratiqués.
- **Avantage :** ressemble à un écran de paramètres moderne (type iOS/Android), très compact, 100 % dynamique.

**Champ avec suffixe d’unité (existant sur le site)**  
- Dans **`app/[locale]/dashboard/profile/offers/OffersForm.tsx`** : le champ prix utilise un wrapper `relative`, un `input` avec `pr-6` (ou équivalent) et un `<span>` en `absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none` pour afficher « € » en permanence. Réutiliser ce **même pattern** pour les champs « Temps à allouer » et « Volume actuel » : suffixe **« /sem. »** (FR) ou **« /week »** (EN), et selon le contexte **« h/sem. »**, **« km/sem. »**, **« m/sem. »** (i18n selon locale + unité du sport).

**Composants à utiliser (Solution E)**  
- **Tels quels :** `Input`, `Button`, `DashboardPageShell`, `lib/formStyles.ts`, `lib/sportStyles.ts`, **`components/SportIcons.tsx`**.  
- **Dynamique :** boucle sur `practicedSports` pour afficher uniquement les sports sélectionnés.

---

## 6. Suite

Une fois **une des solutions UX** (D, E ou F) validée par le PO et les réponses aux questions restantes obtenues, découpage en **user stories** avec critères d’acceptation et référence au mockup (quelle zone de l’écran correspond à quelle US).
