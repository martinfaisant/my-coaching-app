# Spec technique : Prix non modifiable une fois l'offre publiée

**Mode :** Architecte  
**Contexte :** Quand une offre est en statut `published`, le prix et le type de tarification ne doivent plus pouvoir être modifiés (aligné avec Project_context : « prix/type figés après publication »).

---

## 1. Règle métier

- **Offre en brouillon (`draft`)** : `price` et `price_type` sont modifiables.
- **Offre publiée (`published`)** : `price` et `price_type` sont **figés** — toute tentative de modification doit être rejetée (en BDD et côté application).
- **Offre archivée (`archived`)** : pas de modification métier (archivage uniquement) ; inutile d'autoriser la modification du prix.

---

## 2. Modèle de données

**Aucun changement de schéma.**  
Les colonnes concernées existent déjà : `coach_offers.price`, `coach_offers.price_type`, `coach_offers.status`.

---

## 3. Contrainte en base de données (source de vérité)

Garantir la règle au niveau BDD pour tous les clients (app, API, admin SQL).

### 3.1 Trigger BEFORE UPDATE sur `coach_offers`

- **Nom suggéré :** `coach_offers_prevent_price_change_when_published`
- **Logique :**
  - Si `OLD.status = 'published'` **et** que `NEW.price` ou `NEW.price_type` diffère de `OLD` → `RAISE EXCEPTION` avec un message explicite (ex. `price_and_price_type_are_frozen_when_offer_is_published`).
  - Sinon, laisser le UPDATE se poursuivre (y compris le trigger `updated_at` existant).

Gérer les comparaisons avec NULL (offres en draft peuvent avoir `price` / `price_type` NULL) : utiliser `IS DISTINCT FROM` pour comparer OLD et NEW.

**Fichier de migration :** `supabase/migrations/049_coach_offers_price_frozen_when_published.sql`

---

## 4. Couche application

### 4.1 Fichier à modifier : `app/[locale]/dashboard/profile/offers/actions.ts`

**Fonction `saveOffers` :**

- Lors de l'**update** d'une offre existante :
  - Récupérer le `status` de l'offre (déjà possible si on étend le `select` actuel : `id, coach_id, status`).
  - Si `status === 'published'` : **ne pas inclure** `price` ni `price_type` dans l'objet passé à `.update()`. Utiliser les valeurs déjà en base pour ces deux champs (ne pas les écraser avec les valeurs du formulaire).
- Conséquence : le formulaire peut toujours afficher le prix en lecture seule pour les offres publiées ; à la sauvegarde, on n'envoie que les champs modifiables (titres, descriptions, display_order, is_featured).

**Aucun changement** sur `publishOffer` ni `archiveOffer` : la règle ne s'applique qu'aux mises à jour d'offres déjà publiées.

### 4.2 UI / formulaire (décision Développeur)

- Pour les offres **published** : afficher le prix et le type de tarif en **lecture seule** (désactiver ou masquer les champs prix/price_type, avec un court texte explicatif si besoin, ex. « Prix figé après publication »).
- Référence i18n : namespace `offers` (ou `offers.validation`) pour le message « Prix figé après publication » / « Price is locked after publishing ».

---

## 5. RLS

Aucun changement. La policy `coach_offers_update_own` reste en place ; le trigger garantit que même un update autorisé par RLS ne peut pas modifier le prix lorsque `status = 'published'`.

---

## 6. Table des fichiers

| Fichier | Rôle | Action |
|--------|------|--------|
| `supabase/migrations/049_coach_offers_price_frozen_when_published.sql` | Contrainte BDD | **Créer** |
| `app/[locale]/dashboard/profile/offers/actions.ts` | saveOffers : ne pas mettre à jour price/price_type si published | **Modifier** |
| Formulaire offres (composant qui affiche les champs prix) | Lecture seule pour offres published | **Modifier** (Développeur) |
| `messages/fr.json` / `messages/en.json` | Clé « Prix figé après publication » | **Modifier** (Développeur) |

---

## 7. Tests manuels recommandés

1. **Brouillon** : créer une offre draft, modifier le prix, sauvegarder → OK.
2. **Publier** : publier l'offre → OK.
3. **Après publication** : sur la même offre, tenter de changer le prix dans le formulaire et sauvegarder → soit les champs sont en lecture seule et non envoyés, soit le trigger rejette si par erreur price/price_type sont envoyés → message d'erreur clair.
4. **Archivée** : archiver une offre → pas de modification de prix en jeu.
5. (Optionnel) Via SQL ou client Supabase : `UPDATE coach_offers SET price = 99 WHERE id = ... AND status = 'published'` → doit échouer avec l'exception du trigger.

---

## 8. Points à trancher en implémentation

- **Message d'erreur trigger** : libellé exact de l'exception (FR/EN ou code technique). Si l'app affiche ce message à l'utilisateur, prévoir une clé i18n côté app qui mappe l'erreur BDD vers un message utilisateur.
- **Champs titre/description** : la règle demandée ne porte que sur le **prix**. Titre et description restent modifiables après publication sauf décision produit contraire.

---

## 9. Checklist avant livraison (Architecte)

- [x] Migrations cohérentes (une migration trigger, pas de changement de colonnes).
- [x] RLS inchangées, justifiées (trigger suffit).
- [x] Table des fichiers présente.
- [x] Cas limites : draft OK, published figé, archived hors scope.
- [x] Tests manuels indiqués.
