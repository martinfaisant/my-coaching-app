# Spec architecture : séparation des pages « Mes athlètes » et « Trouver mon coach »

**Contexte :** Aujourd'hui, la route unique `/dashboard` affiche selon le rôle soit « Trouver mon coach » (athlète sans coach), soit « Mes athlètes » (coach), soit la vue admin. Un seul `loading.tsx` au niveau dashboard tente de couvrir les deux squelettes (Trouver mon coach + Mes athlètes), ce qui pose des problèmes de gestion des skeletons et de clarté.

**Objectif :** Avoir des **pages distinctes** pour « Mes athlètes » (coach) et « Trouver mon coach » (athlète sans coach), chacune avec son propre skeleton, tout en conservant **une ouverture par défaut** sur la bonne page (redirection depuis `/dashboard`).

**Mode :** Architecte — pas d'implémentation, uniquement architecture, fichiers et points à trancher.

---

## 1. Modèle de données et RLS

**Aucun changement.** Les mêmes requêtes et RLS restent en vigueur ; on ne fait que déplacer le rendu dans de nouvelles routes.

---

## 2. Architecture des routes

| Route | Comportement actuel | Comportement cible |
|-------|---------------------|--------------------|
| `GET /[locale]/dashboard` | Affiche selon rôle : FindCoach / Mes athlètes / Admin | **Uniquement redirections** (voir tableau ci‑dessous). Plus de rendu de contenu pour athlete ni coach. |
| `GET /[locale]/dashboard/find-coach` | N'existe pas | **Nouvelle page** : « Trouver mon coach » (athlète sans coach). Si rôle ≠ athlete ou si `coach_id` présent → redirect. |
| `GET /[locale]/dashboard/athletes` | N'existe pas (existe seulement `athletes/[athleteId]`) | **Nouvelle page** : « Mes athlètes » (coach). Si rôle ≠ coach → redirect. |
| `GET /[locale]/dashboard/athletes/[athleteId]` | Inchangé | Inchangé (détail d'un athlète). |

### Redirections depuis `/[locale]/dashboard`

| Profil | Redirection depuis `/dashboard` |
|--------|----------------------------------|
| Athlète avec `coach_id` | `/dashboard/calendar` (déjà le cas) |
| Athlète sans `coach_id` | `/dashboard/find-coach` |
| Coach | `/dashboard/athletes` |
| Admin | **À trancher** : `/admin/members` ou page dédiée sous dashboard (voir § 6). |

---

## 3. Table des fichiers

| Fichier | Rôle | Action |
|---------|------|--------|
| `app/[locale]/dashboard/page.tsx` | Page d'entrée dashboard | **Modifier** : ne garder que la logique de redirection (et éventuellement le bloc admin si on ne redirige pas l'admin). Supprimer tout le rendu FindCoachSection et CoachAthletesListWithFilter. |
| `app/[locale]/dashboard/loading.tsx` | Skeleton pendant chargement `/dashboard` | **Modifier** : skeleton **minimal** (header + zone vide ou barre de titre seule), car la page ne fait que rediriger et le temps d'affichage est court. |
| `app/[locale]/dashboard/find-coach/page.tsx` | Page « Trouver mon coach » | **Créer** : extraire la logique actuelle « athlète sans coach » de `dashboard/page.tsx` (fetch coaches, requests, ratings, offers + rendu `FindCoachSection` dans `DashboardPageShell`). Guard : si pas athlete ou si `coach_id` → redirect `/dashboard`. |
| `app/[locale]/dashboard/find-coach/loading.tsx` | Skeleton « Trouver mon coach » | **Créer** : skeleton dédié (filtres + grille de tuiles type CoachTile), cohérent avec le design actuel de FindCoachSection. |
| `app/[locale]/dashboard/athletes/page.tsx` | Page « Mes athlètes » (liste) | **Créer** : extraire la logique actuelle « coach » de `dashboard/page.tsx` (pending requests, liste athlètes, CoachAthletesListWithFilter, bloc « compléter le profil », etc.). Guard : si rôle ≠ coach → redirect `/dashboard`. |
| `app/[locale]/dashboard/athletes/loading.tsx` | Skeleton « Mes athlètes » | **Créer** : skeleton dédié (titre, filtre, grille de cartes type AthleteTile / CoachAthletesList). |
| `components/Sidebar.tsx` | Navigation | **Modifier** : lien « Trouver mon coach » (athlète sans coach) → `href="/dashboard/find-coach"`. Lien « Mes athlètes » (coach) → `href="/dashboard/athletes"`. Condition d'item actif pour coach : déjà `path === '/dashboard' \|\| path.startsWith('/dashboard/athletes')` → remplacer la comparaison avec `/dashboard` par `path === '/dashboard/athletes' \|\| path.startsWith('/dashboard/athletes')` pour que seul « Mes athlètes » soit actif sur cette page. |
| `app/[locale]/dashboard/athletes/[athleteId]/page.tsx` | Détail athlète | **Modifier** : les `redirect('/dashboard')` en `redirect('/dashboard/athletes')` pour renvoyer le coach vers la liste des athlètes et non plus vers la page d'entrée. |
| Autres fichiers (actions, revalidatePath, liens) | Références à `/dashboard` | **Vérifier / Modifier** : tout lien ou `revalidatePath('/dashboard')` qui doit cibler la « page d'accueil » coach ou athlete : après implémentation, revalidate des pages concernées (`/dashboard/athletes`, `/dashboard/find-coach`) selon le contexte. Ne pas supprimer `revalidatePath('/dashboard')` si la page dashboard reste le point d'entrée (redirections) ; ajouter selon besoin `revalidatePath('/dashboard/athletes')`, `revalidatePath('/dashboard/find-coach')`. |

**Fichiers à ne pas dupliquer :**
`FindCoachSection.tsx`, `CoachAthletesListWithFilter.tsx`, `RespondToRequestButtons`, actions existantes — ils restent où ils sont et sont **importés** depuis les nouvelles pages.

---

## 4. Logique métier (résumé)

- **Page `/dashboard`** : lecture du profil (rôle, `coach_id`) → redirect uniquement. Option admin : soit redirect vers `/admin/members`, soit afficher le bloc actuel « liste membres + lien Gérer les membres » sur cette même page (alors garder un skeleton générique ou minimal pour ce cas).
- **Page `/dashboard/find-coach`** : réservée athlète sans coach ; même logique de chargement qu'aujourd'hui (coaches, myRequests, ratingStats, offers, etc.) ; même rendu `FindCoachSection` dans `DashboardPageShell`.
- **Page `/dashboard/athletes`** : réservée coach ; même logique qu'aujourd'hui (pending requests, profils athlètes, workouts/goals/subscriptions pour les tuiles, « compléter le profil », etc.) ; même rendu (header actuel + `CoachAthletesListWithFilter` + section demandes en attente). **Important :** aujourd'hui la page dashboard coach n'utilise pas `DashboardPageShell` mais un `<main>` custom — à conserver ou aligner avec `DashboardPageShell` selon les conventions projet (voir § 6).
- **Guards** : sur `find-coach` et `athletes`, vérifier le rôle / `coach_id` et rediriger vers `/dashboard` (ou la page appropriée) si l'utilisateur n'a pas le droit d'être sur cette page.

---

## 5. Tests manuels recommandés

- Ouvrir l'app en tant qu'**athlète sans coach** : après login ou accès à `/dashboard`, redirection vers `/dashboard/find-coach` ; skeleton « Trouver mon coach » visible brièvement ; lien sidebar « Trouver mon coach » actif sur cette page.
- Ouvrir en tant qu'**athlète avec coach** : `/dashboard` → redirection vers `/dashboard/calendar` (inchangé).
- Ouvrir en tant que **coach** : `/dashboard` → redirection vers `/dashboard/athletes` ; skeleton « Mes athlètes » visible ; lien « Mes athlètes » actif sur `/dashboard/athletes` et sur `/dashboard/athletes/[id]`.
- **Admin** : selon choix (§ 6), vérifier redirect ou affichage sur `/dashboard`.
- Vérifier que les **revalidatePath** après actions (demandes coach, acceptation, etc.) invalident bien les bonnes pages (`/dashboard/find-coach`, `/dashboard/athletes`).
- Vérifier accès direct : `/dashboard/find-coach` en tant que coach → redirect ; `/dashboard/athletes` en tant qu'athlète → redirect.

---

## 6. Points à trancher en implémentation

1. **Admin :** Rediriger depuis `/dashboard` vers `/admin/members` (cohérent avec le lien déjà présent « Gérer les membres ») ou garder une page d'accueil dashboard pour l'admin sur `/dashboard` (avec le bloc actuel) ? Recommandation : redirect admin vers `/admin/members` pour que `/dashboard` ne fasse que des redirects et évite un skeleton spécifique admin.
2. **Page « Mes athlètes » (coach) :** Actuellement le rendu coach dans `dashboard/page.tsx` n'utilise pas `DashboardPageShell` mais un `<main>` + header custom. À décider : garder ce layout pour la nouvelle `athletes/page.tsx` ou migrer vers `DashboardPageShell` pour homogénéité (aligné avec la règle projet « toujours utiliser DashboardPageShell pour les pages dashboard »).
3. **URL find-coach :** Utiliser `find-coach` (anglais, cohérent avec le reste des segments) ; pas de changement i18n des URLs attendu.
4. **Metadata / titres :** Chaque nouvelle page (`find-coach`, `athletes`) doit avoir son `generateMetadata` et les clés i18n existantes (`findCoach.pageTitle`, `athletes.dashboard` ou équivalent) pour le titre de la page.

---

## 7. Checklist avant livraison (Architecte)

- [x] Aucun changement BDD / RLS.
- [x] Table des fichiers (Créer / Modifier) présente.
- [x] Redirections depuis `/dashboard` définies pour tous les rôles.
- [x] Guards et comportement des nouvelles routes décrits.
- [x] Tests manuels recommandés listés.
- [x] Points à trancher en implémentation indiqués.

---

**Document rédigé en mode Architecte.** Implémentation à faire en mode Développeur en suivant cette spec et les bonnes pratiques du projet (design system, i18n, `DashboardPageShell`, etc.).
