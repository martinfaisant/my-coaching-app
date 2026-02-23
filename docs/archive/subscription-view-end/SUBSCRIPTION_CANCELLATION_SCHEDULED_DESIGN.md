# Statut « En résiliation » – Brief design & User stories

**Mode :** Designer  
**Date :** 18 février 2026  
**Statut :** Validé PO  
**Référence :** Extension de la feature « Vue et résiliation de la souscription » (`docs/SUBSCRIPTION_VIEW_AND_END_DESIGN.md`).

---

## Implémentation

- **US-R1 à US-R5** : implémentées.
- **Règle ajoutée en implémentation** : **seul le demandeur de la résiliation peut annuler la résiliation** (colonne `cancellation_requested_by_user_id`, migration 045). L'autre partie ne voit pas le bouton (vue athlète : rien à la place ; modale coach : message optionnel « Seule la personne ayant demandé… »).

---

## 1. Récapitulatif des décisions PO

| Question | Décision |
|----------|----------|
| **Free / one-time** | Aucun changement par rapport au comportement actuel (résiliation immédiate, pas de statut « En résiliation »). |
| **Annulation de la résiliation** | Oui : le coach et l’athlète peuvent **annuler la résiliation** tant que la date de fin n’est pas passée (bouton « Annuler la résiliation » ou équivalent). |
| **Où afficher « En résiliation »** | Partout où on affiche aujourd’hui « Active » pour une souscription : bloc Ma souscription (athlète), tuile athlète + modale détail (coach), page Souscriptions (coach). Sur la page Souscriptions du coach : **section dédiée « En résiliation »** avec tuiles dans une couleur spécifique. |
| **Couleur** | **Amber** (token `palette-amber`) pour le badge et la section « En résiliation » (bordure gauche des tuiles, cohérent avec le design system). |

---

## 2. Règles métier

### 2.1 Statut « En résiliation »

- **Applicable uniquement** aux souscriptions **mensuelles** (récurrentes).
- **Déclenchement :** lorsque le coach ou l’athlète clique « Mettre fin à la souscription » et que la fin est programmée au prochain cycle (donc `end_date` est renseignée, souscription encore active jusqu’à cette date).
- **Affichage :** on affiche le statut **« En résiliation »** (badge ambre) et la **date de fin prévue** au lieu de « Active » / « En cours ».
- **Lien coach–athlète :** conservé jusqu’à la date de fin (accès inchangés). Après la date de fin, traitement comme aujourd’hui (status cancelled, coach_id = null, etc.).

### 2.2 Annulation de la résiliation

- Tant que la date de fin n’est pas passée, le coach ou l’athlète peut **annuler la résiliation** : on remet `end_date = null` (ou équivalent selon modèle), la souscription redevient « Active » sans date de fin programmée.
- Après annulation, le bouton « Mettre fin » redevient disponible ; le badge redevient « Active ».

### 2.3 Free / one-time

- Comportement actuel inchangé : résiliation immédiate, pas de phase « En résiliation », pas de bouton « Annuler la résiliation ».

---

## 3. Solution UI (Option A – validée)

Composants et tokens : `docs/DESIGN_SYSTEM.md` (Button, Badge, Modal, palette **amber**).

### 3.1 Règles visuelles

- **Badge « En résiliation »** : style Badge avec **couleur ambre** (`palette-amber`), par ex. `bg-palette-amber/10 text-palette-amber border-palette-amber/20` (ou équivalent design system).
- **Tuiles « En résiliation »** (page coach Souscriptions) : **bordure gauche ambre** `border-l-palette-amber`, même structure que les tuiles actives (vert) et historique (gris).
- **Partout** : quand la souscription est en résiliation (active + end_date renseignée dans le futur), afficher le badge « En résiliation » et la ligne « Fin prévue le {date} » ; **masquer** le bouton « Mettre fin » ; **afficher** le bouton « Annuler la résiliation ».

### 3.2 Athlète – Page Mon Coach (bloc « Ma souscription »)

- Si souscription **active sans** date de fin programmée : comportement actuel (badge « Active », bouton « Mettre fin »).
- Si souscription **en résiliation** (active + end_date future) :
  - Badge **« En résiliation »** (ambre).
  - Ligne **« Fin prévue le {date} »** bien visible.
  - **Pas** de bouton « Mettre fin à la souscription ».
  - Bouton **« Annuler la résiliation »** (variant secondaire, ex. muted ou outline).

### 3.3 Coach – Tuile athlète (Mes athlètes) et modale détail

- Si souscription **en résiliation** : afficher le **titre de la souscription** avec le badge **« En résiliation »** (ambre) dans la modale ; dans la tuile, on peut garder le titre + flèche, et le badge « En résiliation » visible dans la modale.
- Dans la modale détail : badge « En résiliation », date de fin prévue, **pas** de bouton « Mettre fin », bouton **« Annuler la résiliation »**.

### 3.4 Coach – Page « Souscriptions »

- **Trois sections** (dans l’ordre) :
  1. **Souscriptions actives** : tuiles **bordure gauche verte** (`border-l-palette-forest-dark`), souscriptions actives **sans** date de fin programmée ; bouton « Mettre fin », clic → détail en modale.
  2. **En résiliation** : tuiles **bordure gauche ambre** (`border-l-palette-amber`) ; souscriptions actives **avec** end_date future ; affichage « Fin prévue le {date} », pas de bouton « Mettre fin », bouton « Annuler la résiliation » et/ou « Voir le détail » (modale avec même infos + annuler la résiliation).
  3. **Historique** : inchangé (bordure grise, badge « Terminée »).

### 3.5 Modal de confirmation « Annuler la résiliation »

- Titre du type « Annuler la résiliation ? ».
- Corps : explication courte (la souscription restera active au-delà de la date prévue, sans date de fin programmée).
- Boutons : « Annuler » (fermer) et « Oui, annuler la résiliation » (ou équivalent) pour confirmer.

---

## 4. User stories pour la phase Architecte

### US-R1 – Affichage du statut « En résiliation » (athlète)

**En tant qu’** athlète ayant une souscription mensuelle dont la résiliation a été programmée,  
**je veux** voir le statut « En résiliation » et la date de fin prévue sur Mon Coach,  
**afin de** savoir que ma souscription se termine à cette date.

**Critères d’acceptation :**
- Sur le bloc « Ma souscription » (Mon Coach), si la souscription est active avec une date de fin programmée (end_date future), le badge affiché est **« En résiliation »** (ambre) et la ligne « Fin prévue le {date} » est visible.
- Le bouton « Mettre fin à la souscription » n’est **pas** affiché.
- Un bouton **« Annuler la résiliation »** est affiché (variant secondaire).

---

### US-R2 – Annulation de la résiliation (athlète)

**En tant qu’** athlète dont la souscription est en résiliation,  
**je veux** pouvoir annuler la résiliation pour que la souscription reste active sans date de fin,  
**afin de** continuer avec mon coach au-delà de la date prévue.

**Critères d’acceptation :**
- Un clic sur « Annuler la résiliation » ouvre une **modal de confirmation** (titre et texte dédiés).
- Après confirmation, la date de fin programmée est supprimée (end_date = null ou équivalent) ; le bloc affiche à nouveau le badge « Active » et le bouton « Mettre fin ».
- En cas d’erreur, message affiché, modal fermable.

---

### US-R3 – Affichage « En résiliation » (coach – tuile athlète et modale)

**En tant que** coach,  
**je veux** voir le statut « En résiliation » (badge ambre) et la date de fin prévue sur la tuile athlète et dans la modale détail de la souscription,  
**afin de** distinguer les souscriptions actives des souscriptions en fin de parcours.

**Critères d’acceptation :**
- Sur la tuile athlète (Mes athlètes), si la souscription a une end_date future, l’affichage reflète « En résiliation » (ex. dans la modale au clic).
- Dans la modale détail : badge **« En résiliation »** (ambre), date de fin prévue, **pas** de bouton « Mettre fin », bouton **« Annuler la résiliation »**.

---

### US-R4 – Annulation de la résiliation (coach)

**En tant que** coach,  
**je veux** pouvoir annuler la résiliation d’une souscription mensuelle (depuis la modale détail ou la page Souscriptions),  
**afin de** maintenir la souscription active sans date de fin.

**Critères d’acceptation :**
- Même modal de confirmation que côté athlète (ou libellés adaptés coach).
- Après confirmation, end_date supprimée ; l’affichage repasse en « Active » avec bouton « Mettre fin » à nouveau disponible.

---

### US-R5 – Page Souscriptions (coach) : section « En résiliation »

**En tant que** coach,  
**je veux** une section dédiée **« En résiliation »** sur la page Souscriptions, avec des tuiles à bordure gauche ambre,  
**afin de** voir en un coup d’œil les souscriptions qui se terminent à une date programmée.

**Critères d’acceptation :**
- La page Souscriptions comporte **trois sections** : Souscriptions actives (vert), **En résiliation** (ambre), Historique (gris).
- Les tuiles « En résiliation » ont **bordure gauche ambre** (`border-l-palette-amber`), même structure que les autres (athlète, offre, date de fin prévue).
- Sur chaque tuile : possibilité d’ouvrir le détail en modale et d’**annuler la résiliation** (bouton dédié ou via la modale).

---

### US-R6 – Données et modèle (pour l’Architecte)

**Prérequis techniques :**
- Déterminer si le statut « En résiliation » est **dérivé** (souscription active + end_date non nulle et future) ou **stocké** (nouveau statut ex. `cancellation_scheduled`). La décision impacte les requêtes et les RLS.
- **Annulation de la résiliation :** action serveur qui remet end_date à null (et éventuellement ne touche pas au status si on reste en `active`).
- RLS : s’assurer que coach et athlète peuvent **UPDATE** la souscription pour remettre end_date à null (annulation de la résiliation), dans les mêmes conditions que pour la programmation de la fin (monthly).

---

## 5. Synthèse pour la phase Architecte

- **UI :** Option A validée ; badge et section ambre ; bouton « Annuler la résiliation » + modal de confirmation ; section dédiée « En résiliation » sur la page Souscriptions coach.
- **Données :** Gestion de end_date (programmation et annulation) ; pas de changement pour free/one_time.
- **i18n :** Nouveaux libellés FR/EN : « En résiliation », « Annuler la résiliation », « Annuler la résiliation ? », texte de la modal d’annulation, etc.
- **Composants :** Réutilisation Badge, Button, Modal ; token **palette-amber** pour « En résiliation ».

---

**Document à utiliser en entrée de la phase Architecte** pour la spec technique (modèle, migrations, RLS, actions, flux) puis en entrée Développeur pour l’implémentation.
