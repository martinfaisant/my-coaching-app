# Design — Tri de la liste des athlètes par « Planifié jusqu'au »

**Archivé le :** 1er mars 2026  
**Raison :** Feature livrée. Comportement décrit dans **Project_context.md** (§ Coach, Mes athlètes), **docs/DESIGN_SYSTEM.md** (§ SearchInput, § Dropdown, §7).

---

**Mode :** Designer  
**Date :** 1er mars 2026  
**Contexte :** Page coach « Mes athlètes » (`/dashboard/athletes`), composant `CoachAthletesListWithFilter`.

---

## 1. Besoin reformulé

En tant que **coach**, je veux **trier la liste de mes athlètes** en fonction de la date **« Planifié jusqu'au »** (dernière date d'entraînement planifié par athlète), de façon à ce que **celui dont la date est la plus éloignée soit en dernier** dans la liste.

- **Ordre visé :** tri **croissant** par date « planifié jusqu'au » → date la plus proche en premier, la plus éloignée en dernier.
- **Athlètes sans date :** aucun entraînement planifié → à traiter comme « plus urgents à planifier » → affichés **en premier** (avant les dates les plus proches).

---

## 2. Cas à couvrir

| Cas | Description | Comportement attendu |
|-----|-------------|----------------------|
| **Nominal** | Liste avec athlètes ayant des dates « planifié jusqu'au » différentes | Liste triée : sans date d'abord, puis par date croissante (proche → loin). |
| **Même date** | Plusieurs athlètes avec la même date « planifié jusqu'au » | Ordre secondaire stable (ex. ordre initial / nom) pour ne pas faire « sauter » les lignes inutilement. |
| **Filtre nom actif** | Le coach a saisi un filtre par nom | Le tri s'applique sur la **liste filtrée** (même logique : proche → loin, sans date en premier). |
| **Aucun athlète** | Aucun athlète (ou aucun ne correspond au filtre) | Comportement actuel inchangé (message « Aucun athlète ne correspond à votre recherche » / « Vos demandes… »). |
| **Un seul athlète** | Un seul athlète (ou un seul après filtre) | Affichage unique, pas de changement visuel du tri. |

### Données

- **« Planifié jusqu'au »** aujourd'hui = **date max des entraînements** (`workouts.date`) par athlète, déjà calculée côté page (`plannedUntilByAthlete`).
- Pour trier correctement, il faut une **date brute (YYYY-MM-DD)** par athlète, car l'affichage utilise une date formatée (ex. « 15 mars ») inutilisable pour un tri cohérent. Donc : **fournir en plus une clé `plannedUntilRaw` (string YYYY-MM-DD | null)** dans chaque item de la liste.

---

## 3. Solutions UI proposées

Trois options pour exposer le tri « Planifié jusqu'au (proche → loin) » :

- **Solution A — Tri par défaut uniquement**  
  La liste est **toujours** triée par « Planifié jusqu'au » (proche → loin, sans date en premier). Aucun contrôle visible. Comportement simple, pas de choix pour le coach.

- **Solution B — Menu déroulant « Trier par »**  
  À côté du filtre par nom : un **select** « Trier par » avec au moins :  
  **Nom (A–Z)** — **Planifié jusqu'au (proche → loin)** — défaut demandé.

- **Solution C — Deux boutons / segmented control**  
  Deux options côte à côte : **« Par nom »** | **« Par date planifiée »**.

---

## 4–7. (Composants, solution retenue, i18n, user stories)

Voir contenu original ; implémentation livrée avec **SearchInput**, **Dropdown**, tri par nom ou date planifiée. Référence courante : **Project_context.md**, **docs/DESIGN_SYSTEM.md**.
