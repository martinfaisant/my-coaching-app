# Spec technique — État sélectionné tuile Profil (sidebar)

**Contexte :** Besoin Designer validé + mockup `docs/design-sidebar-profile-tile/MOCKUP_SIDEBAR_PROFILE_TILE.html`.  
**Objectif :** Afficher l'état « sélectionné » sur la tuile Profil (bas de la sidebar) lorsque l'utilisateur est sur la page Profil (`/dashboard/profile`), de la même façon que pour les autres entrées du menu.

---

## 1. Architecture et flux

- **Flux :** Côté client uniquement. Le composant `Sidebar` est déjà en `'use client'` et utilise `usePathname()` de `@/i18n/navigation`. Aucun appel serveur, aucune action, aucun nouveau module.
- **Donnée utilisée :** `path` (pathname actuel sans préfixe locale). Condition d'affichage : `path === '/dashboard/profile'` (égalité stricte, pas `startsWith`, pour ne pas sélectionner la tuile Profil sur `/dashboard/profile/offers`).
- **Fichiers impactés :** un seul fichier, `components/Sidebar.tsx`. Aucun nouveau fichier.

---

## 2. Table des fichiers

| Fichier | Rôle | Créer / Modifier |
|--------|------|-------------------|
| `components/Sidebar.tsx` | Sidebar dashboard (athlète + coach) : appliquer état sélectionné au lien « Profil » selon `path` | **Modifier** |

Aucun autre fichier à créer ou modifier (pas de migrations, pas de RLS, pas de lib, pas d'i18n pour ce besoin).

---

## 3. Modèle de données et RLS

- **Modèle de données :** aucun changement.
- **RLS :** aucune évolution (pas d'accès données côté serveur pour cette feature).

---

## 4. Logique métier (côté client)

- **Variable dérivée :** `isProfilePage = (path === '/dashboard/profile')`.
- **Règle d'affichage :**
  - Si `isProfilePage` :
    - Lien « Profil » (avatar + nom + chevron) : mêmes classes d'état sélectionné que les autres entrées du menu, soit  
      `bg-palette-forest-dark text-white shadow-lg shadow-palette-forest-dark/20`  
      (sans bordure `border border-stone-100` en état sélectionné).
    - Texte du nom : `text-white` (au lieu de `text-stone-800`).
    - Chevron : `text-white/80` ou équivalent (au lieu de `text-stone-300` / `group-hover:text-palette-forest-dark`).
    - Avatar : conserver `AvatarImage` et `ring-2 ring-white` ; pas d'obligation de changer le fond de l'avatar (le ring blanc suffit pour la lisibilité sur fond forest-dark).
  - Sinon : garder le comportement actuel (bordure stone-100, bg-stone-50, hover, etc.).
- **Deux blocs à traiter :** le bloc « Profil Bas » dans la branche **athlète** (lignes ~219–234) et le bloc « Profil Bas » dans la branche **coach** (lignes ~341–354). Même logique pour les deux.
- **Sidebar repliée :** la même condition `path === '/dashboard/profile'` s'applique ; en replié, le lien reste un seul bloc (avatar centré), avec les mêmes classes de fond/ombre en état sélectionné.

---

## 5. Cas limites et contraintes

- **Sous-route `/dashboard/profile/offers` :** ne doit **pas** activer l'état sélectionné sur la tuile Profil ; seul le lien « Offres » du menu coach doit être sélectionné. D'où l'usage de `path === '/dashboard/profile'` et non `path.startsWith('/dashboard/profile')`.
- **Locale :** `usePathname()` vient de `@/i18n/navigation` et retourne le pathname sans segment de locale ; aucune adaptation nécessaire.
- **Accessibilité :** pas de changement de rôle sémantique (le lien reste un lien) ; le contraste texte blanc sur fond forest-dark est conforme à l'existant des autres items sélectionnés.

---

## 6. Tests manuels recommandés

1. **Athlète — page Profil**  
   Aller sur `/dashboard/profile` (ou équivalent avec locale) : la tuile Profil en bas de la sidebar doit être en état sélectionné (fond vert, texte blanc, ombre), identique aux autres entrées sélectionnées.

2. **Athlète — autre page**  
   Aller sur Calendrier, Objectifs, etc. : la tuile Profil doit rester en style par défaut (bordure, fond stone-50).

3. **Coach — page Profil**  
   Même vérification que pour l'athlète sur `/dashboard/profile`.

4. **Coach — page Offres**  
   Aller sur `/dashboard/profile/offers` : seul « Offres » doit être sélectionné ; la tuile Profil (avatar + nom) en bas ne doit **pas** être en état sélectionné.

5. **Sidebar repliée**  
   Replier la sidebar (desktop) : sur Profil, la tuile réduite à l'avatar doit afficher le fond vert et l'ombre ; sur une autre page, style par défaut.

6. **Mobile / petit écran**  
   Vérifier que le comportement (sélectionné vs non sélectionné) reste cohérent lorsque la sidebar est affichée.

---

## 7. Points à trancher en implémentation

- **Avatar en état sélectionné :** le mockup propose un fond d'avatar en `bg-white/30` pour la cohérence visuelle. En implémentation, on peut soit garder `AvatarImage` tel quel (ring blanc suffit), soit ajouter un wrapper/className conditionnel pour un fond semi-transparent sur l'avatar lorsque `isProfilePage`. À décider selon rendu visuel final.
- **Chevron en état sélectionné :** utiliser `text-white/80` ou `text-white` selon contraste souhaité ; pas d'impact fonctionnel.

---

## 8. Checklist avant livraison (Architecte)

- [x] Aucun changement BDD — pas de migrations.
- [x] Aucune RLS — non concerné.
- [x] Table des fichiers présente et à jour.
- [x] Cas limites listés (sous-route profile/offers, locale, replié).
- [x] Tests manuels recommandés indiqués.
- [x] Points à trancher en implémentation signalés (avatar, chevron).

---

**Références :**  
- Mockup : `docs/design-sidebar-profile-tile/MOCKUP_SIDEBAR_PROFILE_TILE.html`  
- Design system : `docs/DESIGN_SYSTEM.md` (tokens palette-forest-dark, ombres)  
- Composant : `components/Sidebar.tsx`
