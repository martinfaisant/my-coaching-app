# Filtre par nom – Page « Mes athlètes » (coach)

**Mode :** Designer  
**Besoin :** En tant que coach, sur la page de mes athlètes, pouvoir filtrer les athlètes en tapant leur nom.

---

## 1. Synthèse du besoin et cas identifiés

| Cas | Description |
|-----|-------------|
| **Nominal** | Le coach tape tout ou partie du nom (prénom ou nom) ; la liste affiche uniquement les athlètes dont le nom affiché contient la chaîne (insensible à la casse). |
| **Champ vide** | Si le champ est vide, tous les athlètes sont affichés. |
| **Aucun résultat** | Si la recherche ne correspond à aucun athlète, afficher un message explicite (ex. « Aucun athlète ne correspond à votre recherche ») sans casser le layout. |
| **Limite** | Filtrage côté client sur la liste déjà chargée (pas de nouvelle requête API) — les noms disponibles sont ceux déjà présents (displayName = prénom + nom ou email). |

**Choix PO (validés) :**
- **Solution retenue :** A (champ inline à côté du titre « Mes athlètes »).
- **Filtre :** uniquement sur le **nom affiché** (prénom / nom) — pas de filtre sur l’email (nom/prénom seront rendus obligatoires plus tard).
- **Réinitialisation :** le filtre se réinitialise à la sortie de la page (pas de persistance ni query param).
- **Accents :** « e » et « é » (et autres lettres accentuées) sont considérés comme identiques pour le filtre (normalisation NFD + suppression des diacritiques).
- **Titres et effectifs :** le nombre d’athlètes n’est plus dans le titre principal de la page mais à côté du titre de la section « Mes athlètes » (ex. « Mes athlètes (3) »). Idem pour les demandes en attente : le nombre est à côté du titre de section (ex. « Demandes en attente (2) »). Le titre de page (h1) pour le coach est générique (ex. « Tableau de bord ») sans nombre.

---

## 2. Deux solutions UI proposées

Deux options d’emplacement et de mise en forme du champ de recherche, avec le même comportement métier (filtre au tap, liste filtrée, message « aucun résultat »).

---

### Solution A – Champ de recherche inline à côté du titre « Mes athlètes »

**Idée :** Un champ de type recherche, placé sur la même ligne que le titre « Mes athlètes » (ou juste en dessous sur mobile), compact et toujours visible avec la section.

**Composants design system :**
- **Utiliser tels quels :** `Input` (type="search", placeholder i18n), tokens (`text-stone-900`, `border-stone-200`, `rounded-lg`, etc.), `FORM_BASE_CLASSES` / styles existants pour le champ.
- **À faire évoluer :** Aucun. Optionnel : réutiliser le pattern label « Rechercher par nom » comme dans FindCoachSection (label au-dessus en `text-xs font-bold uppercase tracking-wider text-stone-400`) si on préfère un petit label au lieu d’un simple placeholder.

**Avantages :** Très discret, pas de bloc dédié ; la section reste visuellement légère.  
**Inconvénients :** Sur mobile, titre + champ sur une ligne peut être serré ; on peut passer en colonne (titre au-dessus, champ en dessous) en responsive.

---

### Solution B – Barre de recherche au-dessus de la grille (pleine largeur)

**Idée :** Une barre de recherche pleine largeur, au-dessus de la grille d’athlètes, éventuellement avec une icône loupe (visuelle uniquement en mockup). Même logique : filtre au tap, message si aucun résultat.

**Composants design system :**
- **Utiliser tels quels :** `Input` (type="search"), tokens, `AthleteTile` / grille existante.
- **À faire évoluer :** Aucun. Si on souhaite une icône loupe à gauche du champ, on peut soit envelopper `Input` dans un conteneur avec icône (wrapper léger), soit documenter un variant « avec icône » dans DESIGN_SYSTEM pour réutilisation future (optionnel).

**Avantages :** Très visible, hiérarchie claire « je filtre puis je vois la liste » ; cohérent avec d’autres écrans type « liste + filtre ».  
**Inconvénients :** Prend une ligne dédiée ; sur très petits écrans peut réduire un peu l’espace pour les cartes.

---

## 3. Mockups HTML (non fonctionnels)

Les deux mockups ci-dessous sont en **HTML statique** (pas de JavaScript) pour valider le rendu visuel. Les couleurs et espacements respectent `tailwind.config.ts` et `docs/DESIGN_SYSTEM.md`.

---

### Mockup A – Champ inline avec titre « Mes athlètes »

```html
<!-- Section Mes athlètes : titre + champ recherche même bloc -->
<section class="mb-6">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
    <h2 class="text-base font-semibold text-stone-900">Mes athlètes</h2>
    <div class="w-full sm:w-64">
      <input
        type="search"
        placeholder="Rechercher un athlète"
        aria-label="Rechercher un athlète"
        class="w-full px-4 py-2.5 rounded-lg border border-stone-300 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-palette-forest-dark focus:border-transparent"
      />
    </div>
  </div>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <!-- Les tuiles athlètes existantes (AthleteTile) ici -->
    <div class="rounded-2xl border border-stone-200 shadow-sm p-6 bg-white">
      <p class="font-semibold text-stone-900">Marie Dupont</p>
      <p class="text-sm text-stone-500">À jour · Planifié jusqu'au 15/03</p>
    </div>
    <div class="rounded-2xl border border-stone-200 shadow-sm p-6 bg-white">
      <p class="font-semibold text-stone-900">Thomas Martin</p>
      <p class="text-sm text-stone-500">À jour · Planifié jusqu'au 22/03</p>
    </div>
    <div class="rounded-2xl border border-stone-200 shadow-sm p-6 bg-white">
      <p class="font-semibold text-stone-900">Julie Bernard</p>
      <p class="text-sm text-stone-500">En retard · Planifié jusqu'au 01/03</p>
    </div>
  </div>
</section>
```

**État « aucun résultat » (à prévoir en implémentation) :** remplacer la grille par un bloc unique du type :
- « Aucun athlète ne correspond à votre recherche » (texte `text-stone-600`, bloc `rounded-xl border border-stone-200 bg-stone-50 p-6`).

---

### Mockup B – Barre de recherche pleine largeur au-dessus de la grille

```html
<!-- Barre de recherche dédiée -->
<section class="mb-6">
  <h2 class="text-base font-semibold text-stone-900 mb-4">Mes athlètes</h2>
  <div class="relative mb-6">
    <label for="athlete-search" class="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
      Rechercher par nom
    </label>
    <input
      id="athlete-search"
      type="search"
      placeholder="Rechercher un athlète"
      aria-label="Rechercher un athlète"
      class="w-full px-4 py-2.5 rounded-lg border border-stone-300 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-palette-forest-dark focus:border-transparent"
    />
  </div>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <div class="rounded-2xl border border-stone-200 shadow-sm p-6 bg-white">
      <p class="font-semibold text-stone-900">Marie Dupont</p>
      <p class="text-sm text-stone-500">À jour · Planifié jusqu'au 15/03</p>
    </div>
    <div class="rounded-2xl border border-stone-200 shadow-sm p-6 bg-white">
      <p class="font-semibold text-stone-900">Thomas Martin</p>
      <p class="text-sm text-stone-500">À jour · Planifié jusqu'au 22/03</p>
    </div>
    <div class="rounded-2xl border border-stone-200 shadow-sm p-6 bg-white">
      <p class="font-semibold text-stone-900">Julie Bernard</p>
      <p class="text-sm text-stone-500">En retard · Planifié jusqu'au 01/03</p>
    </div>
  </div>
</section>
```

**État « aucun résultat » :** même traitement que pour la solution A.

---

## 4. Récapitulatif composants

| Élément | Solution A | Solution B |
|--------|------------|------------|
| **Input** | Tel quel (`Input`, type="search") | Tel quel + optionnel label au-dessus (style FindCoachSection) |
| **Grille** | Inchangée (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`) | Inchangée |
| **Tuiles** | `CoachAthleteTileWithModal` / `AthleteTile` tels quels | Idem |
| **Message aucun résultat** | Bloc unique (texte + bordure/fond design system) | Idem |
| **Nouveau composant** | Aucun | Aucun (optionnel : wrapper « champ avec icône » si PO souhaite icône loupe) |

---

## 5. i18n

- **Namespace recommandé :** `athletes` (déjà utilisé pour la page dashboard / athlètes).
- **Clés à prévoir :**  
  - Placeholder du champ : ex. `athletes.nameFilterPlaceholder` (ou réutiliser `searchPlaceholder` / `searchAthletePlaceholder` si déjà présents dans un namespace partagé).  
  - Message aucun résultat : ex. `athletes.noMatchForSearch` (« Aucun athlète ne correspond à votre recherche » / « No athlete matches your search »).

---

## 6. User stories (solution A validée)

### US1 – Afficher le champ de recherche « Mes athlètes »

**Titre :** Champ de recherche inline dans la section Mes athlètes (coach)

**Description :** En tant que coach, je vois un champ de recherche à côté du titre « Mes athlètes » afin de pouvoir filtrer la liste par nom.

**Critères d’acceptation :**
- [ ] Sur la page dashboard (vue coach), la section « Mes athlètes » affiche un champ de type search sur la même ligne que le titre « Mes athlètes » (ou en dessous sur mobile : `flex-col sm:flex-row`).
- [ ] Le champ a un placeholder traduit (FR/EN), ex. « Rechercher un athlète » / « Search for an athlete ».
- [ ] Le champ est accessible (aria-label ou label associé).
- [ ] Styles : design system (Input, tokens, `rounded-lg`, `border-stone-300`, focus ring `palette-forest-dark`). Largeur du champ : pleine largeur sur mobile, `sm:w-64` (ou équivalent) sur desktop.
- [ ] Référence mockup : `docs/design/coach-athletes-filter-mockup.html` — bloc « Solution A » (titre + input + grille).

**Périmètre :** Page dashboard, rôle coach uniquement. Pas affiché pour admin ni athlète.

**i18n :** Namespace `athletes`. Clé proposée : `nameFilterPlaceholder` (ou réutilisation de `searchPlaceholder` / `searchAthletePlaceholder` si déjà dans le namespace).

---

### US2 – Filtrer la liste des athlètes par nom (prénom / nom)

**Titre :** Filtrage en temps réel par nom affiché

**Description :** En tant que coach, quand je saisis du texte dans le champ de recherche, la liste des athlètes affichée est filtrée pour ne montrer que ceux dont le nom affiché contient la chaîne (insensible à la casse).

**Critères d’acceptation :**
- [ ] Le filtre s’applique sur le **nom affiché** (displayName : prénom + nom, ou email si pas de nom). Pas de filtre sur l’email en tant que critère séparé.
- [ ] Comparaison insensible à la casse et trim de la saisie (espaces en trop ignorés).
- [ ] Filtrage côté client sur la liste déjà chargée (pas de nouvel appel API).
- [ ] Si le champ est vide, tous les athlètes de la liste sont affichés.
- [ ] À la sortie de la page (navigation ailleurs), le filtre est réinitialisé : au retour sur le dashboard, le champ est vide et toute la liste est affichée.

**Périmètre :** Page dashboard, rôle coach. Données : liste des athlètes déjà récupérée côté serveur.

**Référence mockup :** Même section « Solution A » ; le comportement correspond à la grille affichée mise à jour selon la saisie.

---

### US3 – Afficher un message lorsqu’aucun athlète ne correspond

**Titre :** Message « Aucun résultat » pour le filtre par nom

**Description :** En tant que coach, quand ma recherche ne correspond à aucun athlète, je vois un message clair à la place de la grille.

**Critères d’acceptation :**
- [ ] Lorsque le filtre appliqué donne 0 résultat (saisie non vide), la grille est remplacée par un bloc unique contenant un message du type : « Aucun athlète ne correspond à votre recherche » / « No athlete matches your search ».
- [ ] Styles : bloc `rounded-xl border border-stone-200 bg-stone-50 p-6`, texte `text-stone-600` (ou équivalent design system). Pas de liste vide sans explication.
- [ ] Dès que la saisie est modifiée ou vidée pour à nouveau correspondre à au moins un athlète, la grille réapparaît.

**Périmètre :** Page dashboard, section « Mes athlètes », rôle coach.

**i18n :** Namespace `athletes`. Clé proposée : `noMatchForSearch`.

**Référence mockup :** `docs/design/coach-athletes-filter-mockup.html` — section « État Aucun résultat ».

---

## 7. Checklist avant livraison (Designer → Architecte)

- [x] Design system et composants existants consultés ; composants à réutiliser listés (Input, grille, AthleteTile / CoachAthleteTileWithModal).
- [x] Mockup ouvert et validé visuellement (Solution A).
- [x] Chaque user story comporte une référence au mockup ou à la zone concernée.
