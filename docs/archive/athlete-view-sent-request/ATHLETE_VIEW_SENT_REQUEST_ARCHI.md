# Spec technique : Voir la demande envoyée (athlète)

**Mode :** Architecte  
**Date :** 22 février 2026  
**Référence design :** `docs/ATHLETE_VIEW_SENT_REQUEST_DESIGN.md`  
**Mockup :** `docs/athlete-view-sent-request-mockup.html`

---

## 1. Vue d'ensemble

L'athlète peut **consulter le détail** de la demande qu'il a envoyée à un coach (statut pending) : le footer de la tuile coach affiche « Annuler la demande » (danger) et « Demande envoyée > » (muted, avec icône Send) ; le clic sur « Demande envoyée > » ouvre une modale avec le détail (offre figée, sports, message, date). Aucun changement de schéma BDD ; lecture seule sur `coach_requests` (RLS existante).

---

## 2. Architecture et flux

### 2.1 Flux nominal

1. **Page dashboard (athlète)** : `getMyCoachRequests()` fournit déjà `id`, `coach_id`, `status` ; on construit `requestIdByCoach` et `statusByCoach`. Aucun changement côté page.
2. **FindCoachSection** : pour chaque coach, le `footer` de `CoachTile` est fourni par `RequestCoachButton` (inchangé en entrée). Quand `requestStatus === 'pending'`, le **contenu** rendu par `RequestCoachButton` change : au lieu d'un bloc vertical « Demande envoyée » + lien « Annuler », on affiche une **ligne horizontale** : à gauche bouton danger « Annuler la demande », à droite bouton muted « Demande envoyée » + icône Send + chevron `>`.
3. **Clic « Demande envoyée > »** : ouverture d'une modale (composant `Modal`). La modale appelle une **nouvelle action serveur** `getCoachRequestDetail(requestId)` pour récupérer les champs détail (frozen_*, sport_practiced, coaching_need, created_at). Le nom du coach est déjà connu côté parent (`CoachTile` / `FindCoachSection`), on le transmet au composant qui gère la modale.
4. **Contenu modale** : affichage lecture seule (titre « Votre demande », sous-titre « Envoyée à [Nom] · [Date] », pill « En attente » avec icône sablier, bloc offre, sports avec badges+icônes, message en citation, footer Annuler / Fermer). En cas d'erreur ou demande introuvable : message « Demande introuvable » + bouton Fermer (US4).
5. **Annuler depuis la modale** : même flux que depuis la tuile (confirmation existante via `cancelCoachRequest`), puis fermeture de la modale et `router.refresh()`.

### 2.2 Flux erreur

- `getCoachRequestDetail(requestId)` : si la ligne n'existe pas ou n'appartient pas à l'athlète (RLS), retourner une structure « not found » ou erreur. La modale affiche alors un état « Demande introuvable » avec bouton Fermer (US4).

---

## 3. Modèle de données

**Aucune migration.** On s'appuie sur la table existante `coach_requests` :

- Colonnes utilisées pour le détail : `id`, `coach_id`, `athlete_id`, `status`, `sport_practiced`, `coaching_need`, `created_at`, `frozen_title_fr`, `frozen_title_en`, `frozen_title`, `frozen_description_fr`, `frozen_description_en`, `frozen_description`, `frozen_price`, `frozen_price_type`.
- RLS existante **coach_requests_select_athlete** : `USING (athlete_id = auth.uid())` — une requête `SELECT` filtrée par `id` et `athlete_id = auth.uid()` suffit pour que l'athlète ne voie que sa demande.

---

## 4. RLS

Aucune modification. La politique `coach_requests_select_athlete` permet déjà à l'athlète de lire ses propres lignes. L'action `getCoachRequestDetail` fera un `select().eq('id', requestId).eq('athlete_id', user.id).single()` ; seules les lignes autorisées seront retournées.

---

## 5. Table des fichiers

| Fichier | Rôle | Créer / Modifier |
|---------|------|-------------------|
| `app/[locale]/dashboard/actions.ts` | Ajout action `getCoachRequestDetail(requestId)` retournant le détail d'une demande (pour l'athlète connecté). | **Modifier** |
| `app/[locale]/dashboard/RequestCoachButton.tsx` | Quand `requestStatus === 'pending'` : nouveau layout footer (flex horizontal : Annuler danger, Demande envoyée muted + icône Send + chevron). Gestion ouverture modale détail ; appel à `getCoachRequestDetail` à l'ouverture ; affichage contenu ou état erreur. Réutiliser confirmation annulation existante ; bouton « Annuler la demande » en variant **danger**. | **Modifier** |
| `app/[locale]/dashboard/AthleteSentRequestDetailModal.tsx` | Nouveau composant : modale détail demande (titre, envoyée à + date, pill En attente + sablier, bloc offre, sports avec Badge+icônes, message citation, footer Annuler / Fermer). Reçoit soit les données déjà chargées soit requestId + coachName et charge le détail (ou délègue le chargement au parent). Utilise `Modal`, `Button`, `Badge`, `getFrozenTitleForLocale`, `getFrozenDescriptionForLocale`. | **Créer** |
| `components/icons/IconHourglass.tsx` (ou équivalent) | Icône sablier pour la pill « En attente ». (Fichier fourni par le Designer ou usage d'une icône Lucide cohérente.) | **Créer** (ou réutiliser si existe) |
| `messages/fr.json`, `messages/en.json` | Clés i18n pour la modale : titre « Votre demande », « Envoyée à », « En attente », « Offre choisie », « Sports pratiqués », « Votre message », « Annuler la demande », « Fermer », « Demande introuvable », etc. Namespace proposé : `athleteSentRequest` ou extension `requestCoachButton`. | **Modifier** |
| `components/CoachTile.tsx` | Aucun changement structurel. Le footer passé par le parent peut être un div contenant deux boutons ; le style `[&_button]:w-full` du footer s'applique aux boutons (ils partagent l'espace en flex). | **Aucun** (ou ajustement mineur si le layout flex du footer l'exige) |

---

## 6. Détail des évolutions

### 6.1 Action serveur `getCoachRequestDetail`

- **Signature** : `getCoachRequestDetail(requestId: string): Promise<{ error?: string } | CoachRequestDetail>`.
- **Sécurité** : `requireUser` ; lecture `coach_requests` avec `.eq('id', requestId)` ; la RLS impose `athlete_id = auth.uid()`, donc une seule ligne possible pour l'athlète.
- **Retour** : Objet avec `id`, `coach_id`, `status`, `sport_practiced`, `coaching_need`, `created_at`, `frozen_title_fr`, `frozen_title_en`, `frozen_title`, `frozen_description_fr`, `frozen_description_en`, `frozen_description`, `frozen_price`, `frozen_price_type`. Pas besoin de joindre `profiles` : le nom du coach est fourni par l'appelant (FindCoachSection a déjà le coach dans la liste).
- **Cas non trouvé** : `.single()` peut renvoyer une erreur ou null ; retourner `{ error: 'requestNotFound' }` ou une structure `{ notFound: true }` pour que la modale affiche l'état US4.

### 6.2 RequestCoachButton

- **État pending** : au lieu de `<div className="flex flex-col items-center gap-2">` avec texte + lien Annuler, rendre un **conteneur flex horizontal** (ex. `flex items-center justify-between gap-3`) avec :
  - À gauche : `<Button variant="danger" ...>` « Annuler la demande » → ouvre la modale de confirmation d'annulation existante.
  - À droite : `<Button variant="muted" ...>` avec icône Send (avant le texte) + « Demande envoyée » + chevron `>` → ouvre la modale de détail (état `detailModalOpen`).
- **Modale détail** : soit incluse dans `RequestCoachButton`, soit composant séparé `AthleteSentRequestDetailModal` rendu par `RequestCoachButton`. À l'ouverture : appeler `getCoachRequestDetail(requestId)` (avec `requestId` et `coachName` en props). Afficher loading puis contenu ou état « Demande introuvable ».
- **Icône Send** : réutiliser une icône type « send » (ex. Lucide Send) à gauche du libellé « Demande envoyée ».

### 6.3 AthleteSentRequestDetailModal

- **Props** : `isOpen`, `onClose`, `requestId`, `coachName`, `locale`. Optionnel : `initialData?: CoachRequestDetail` pour éviter un second fetch si le parent a déjà les données.
- **Comportement** : si `initialData` absent, au montage / à l'ouverture appeler `getCoachRequestDetail(requestId)`. États : loading, error/notFound (message + Fermer), success (contenu selon mockup).
- **Contenu** : Header (titre, « Envoyée à [coachName] · [date formatée] », pill « En attente » + `IconHourglass`), bloc offre (getFrozenTitleForLocale, getFrozenDescriptionForLocale, prix ou « Gratuit »), sports (sport_practiced split par virgule, badges avec `Badge` + sport), message (coaching_need, style citation), footer (Annuler la demande danger, Fermer muted, même taille).
- **Annuler la demande** : au clic, fermer la modale détail et ouvrir la même logique de confirmation d'annulation que dans la tuile (réutilisation de la modale de confirmation existante ou appel à la même fonction `cancelCoachRequest` après confirmation).

### 6.4 CoachTile

- Le footer actuel applique `[&_button]:w-full` aux descendants. Si le nouveau footer est un `div` avec deux `Button` en flex, les deux auront `w-full` et se partageront l'espace (comportement acceptable). Si le rendu n'est pas correct (ex. deux boutons en colonne), le Développeur pourra ajuster en passant une classe sur le conteneur du footer (ex. `flex flex-1` sur les boutons au lieu de dépendre de `w-full`) ou en documentant une exception pour ce footer dans `CoachTile`.

---

## 7. Logique métier

- **Affichage titre/description offre** : `getFrozenTitleForLocale(row, locale)` et `getFrozenDescriptionForLocale(row, locale)` depuis `lib/frozenOfferI18n.ts`.
- **Prix** : si `frozen_price_type === 'free'` (ou équivalent), afficher « Gratuit » ; sinon `frozen_price` + libellé selon type (mois / forfait) — cohérent avec le design system et les offres.
- **Sports** : `sport_practiced` est une chaîne (ex. `"course,trail"`). Split par virgule, trim ; pour chaque valeur valide reconnue (course, trail, velo, …), afficher un `Badge` avec `sport={value}` pour avoir l'icône et le style. Valeurs inconnues : afficher en texte ou ignorer (à trancher en implémentation).
- **Date** : formater `created_at` avec les utilitaires projet (ex. `format` de date-fns ou équivalent) selon la locale (ex. « 22 février 2026 »).

---

## 8. Tests manuels recommandés

1. **Athlète, demande en attente** : sur la page Trouver un coach, pour un coach avec demande pending, vérifier que le footer affiche bien « Annuler la demande » (danger) à gauche et « Demande envoyée » + icône + chevron (muted) à droite.
2. **Ouverture modale** : clic sur « Demande envoyée > » → la modale s'ouvre avec le bon titre, nom du coach, date, offre, sports, message.
3. **Fermeture** : X, overlay, bouton Fermer → la modale se ferme.
4. **Annuler depuis la modale** : clic sur « Annuler la demande » → ouverture de la confirmation d'annulation ; après confirmation, la demande est supprimée, la modale se ferme, la page se rafraîchit (tuile repasse en « Choisir ce coach » ou disparition de l'état pending).
5. **Erreur / introuvable** : simuler une demande supprimée (ex. annuler dans un autre onglet) puis ouvrir la modale → affichage « Demande introuvable » et bouton Fermer.
6. **i18n** : basculer FR/EN et vérifier tous les libellés de la modale et du footer.
7. **Responsive** : vérifier le footer tuile et la modale sur mobile (breakpoints).

---

## 9. Points à trancher en implémentation

- **Namespace i18n** : créer `athleteSentRequest` ou étendre `requestCoachButton` ; documenter dans `docs/I18N.md` (ou laisser à l'Analyste).
- **Icône sablier** : intégrer le SVG fourni par le Designer (hourglass.svg) dans un composant `IconHourglass` ou utiliser une icône Lucide existante si cohérente.
- **Sport non reconnu** : si `sport_practiced` contient une valeur qui n'est pas dans les clés de `Badge` / SPORT_ICONS, afficher un badge par défaut : Non défini
- **CoachTile footer** : si le layout à deux boutons ne rend pas correctement avec `[&_button]:w-full`, ajouter une classe utilitaire ou une prop optionnelle sur `CoachTile` pour ce cas (éviter de casser les autres usages du footer).

---

## 10. Checklist livraison Architecte

- [x] Aucune migration BDD ; lecture seule sur `coach_requests`.
- [x] RLS existante suffisante ; pas de nouvelle politique.
- [x] Table des fichiers (Créer/Modifier) fournie.
- [x] Actions serveur et flux décrits.
- [x] Cas erreur / not found couverts.
- [x] Tests manuels recommandés listés.
- [x] Points à trancher en implémentation indiqués.
