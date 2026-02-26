# Spec technique – Succès inscription et distinction « nouveau compte » / « email renvoyé »

**Mode :** Architecte  
**Entrée :** User stories `docs/auth-signup-success-US.md` (Designer)  
**Date :** 26 février 2026

---

## 1. Objectif

- Distinguer côté backend **nouveau compte créé** vs **compte existant non confirmé (email de confirmation renvoyé)** pour que le front affiche deux messages différents.
- Conserver et exploiter le cas **compte existant déjà confirmé** (erreur → bascule sur connexion avec message + email pré-rempli).

Aucun changement de modèle de données ni de RLS.

---

## 2. Comportement Supabase utilisé

- **signUp** avec un email **déjà existant mais non confirmé** : Supabase retourne **succès** (pas d’erreur) et renvoie l’email de confirmation. La réponse contient `data.user` avec **`identities` vide** (`data.user.identities?.length === 0`).
- **signUp** avec un **nouvel** email : succès avec `data.user.identities` **non vide** (au moins une identity créée).
- **signUp** avec un email **déjà confirmé** : Supabase retourne une **erreur** (ex. « User already registered »), gérée par `handleSignupError` → `userExists` + `existingEmail`.

On s’appuie sur `data.user.identities?.length === 0` pour détecter « email renvoyé » (compte existant non confirmé).

---

## 3. Architecture et flux

### 3.1 Flux signup (backend)

1. Validation email / mot de passe / rôle (inchangé).
2. Appel `supabase.auth.signUp(...)`.
3. **Si erreur** → `handleSignupError` → retour `{ error, userExists?, existingEmail? }` (inchangé).
4. **Si succès et `data.user`** :
   - **Si `data.user.identities` vide** (length === 0) → **compte existant non confirmé, email renvoyé** :
     - Ne pas insérer en `profiles` (éviter doublon / erreur clé).
     - Retourner : `{ success: t('confirmationEmailResent'), successType: 'emailResent', email }`.
   - **Sinon** (nouveau compte) :
     - Créer le profil (admin) comme aujourd’hui.
     - Si erreur profil → `{ error: t('profileCreationError') }`.
     - Si session présente → redirect dashboard (inchangé).
     - Sinon (email à confirmer) → retourner : `{ success: t('accountCreatedSuccess'), successType: 'accountCreated' }`.
5. Sinon → `{ error: t('signupGenericError') }`.

### 3.2 Contrat retour signup (SignupState)

Le type `SignupState` doit être étendu pour le front :

- `success?: string` — message traduit à afficher (déjà présent).
- **`successType?: 'accountCreated' | 'emailResent'`** — permet au front d’afficher le bon titre / le bon bloc (nouveau compte vs email renvoyé).
- **`email?: string`** — présent quand `successType === 'emailResent'` pour afficher « Un nouvel email a été envoyé à {email} » (optionnel si le message i18n contient déjà la variable, selon choix implémentation).

Le front utilisera `successType` pour choisir le titre et éventuellement le paragraphe (ou un seul message via `success` déjà traduit avec l’email si besoin).

---

## 4. Table des fichiers

| Fichier | Rôle | Action |
|--------|------|--------|
| `app/[locale]/login/actions.ts` | Server action signup, type SignupState | **Modifier** : après succès signUp, brancher sur `identities.length === 0` (email renvoyé) vs nouveau compte ; étendre SignupState (`successType`, `email` si utile) ; retourner les bons messages traduits. |
| `lib/authErrors.ts` | Erreurs auth | Aucune modification (déjà userExists / existingEmail pour compte confirmé). |
| `messages/fr.json` | Traductions FR | **Modifier** : ajouter `auth.errors.accountCreatedSuccess`, `auth.errors.confirmationEmailResent`. |
| `messages/en.json` | Traductions EN | **Modifier** : ajouter `auth.errors.confirmationEmailResent` (accountCreatedSuccess déjà présent). |
| `components/LoginForm.tsx` | Modale auth (login / signup) | **Modifier** : selon SignupState (success + successType) afficher l’écran succès dédié (sans formulaire) avec titre/texte selon successType ; pour userExists basculer sur login avec message « compte existant » + email pré-rempli (état déjà partiellement là, ajouter affichage du message sur la vue login). |
| `app/[locale]/login/page.tsx` | Page login standalone | **Modifier** : aligner sur les mêmes états (succès avec successType, compte existant → message + email pré-rempli). |

Aucune migration, aucun nouveau fichier obligatoire (sauf si le front extrait un sous-composant « SignupSuccessScreen » pour réutilisation page + modale, à la discrétion du dev).

---

## 5. Modèle de données et RLS

- **Aucun changement** : pas de nouvelle table, pas de modification de schéma.
- **Règles métier** : pour un signUp réussi avec `identities` vide, ne pas appeler `profiles.insert` (le profil peut déjà exister depuis la première tentative d’inscription).

---

## 6. i18n

- **Namespace** : `auth.errors` (déjà utilisé pour les retours signup).
- **Clés à ajouter / compléter** :
  - **FR** (`messages/fr.json`) :
    - `auth.errors.accountCreatedSuccess` : « Compte créé. Consultez votre boîte mail pour confirmer votre adresse, puis connectez-vous. » (ou équivalent).
    - `auth.errors.confirmationEmailResent` : « Un nouvel email de confirmation a été envoyé à {email}. Consultez votre boîte mail. » (avec placeholder `{email}` si le front affiche l’email dynamiquement ; sinon phrase sans variable).
  - **EN** (`messages/en.json`) :
    - `auth.errors.confirmationEmailResent` : « A new confirmation email has been sent to {email}. Please check your inbox. » (ou équivalent, avec ou sans placeholder).
- Vérifier que tous les textes affichés (titres succès, bandeau « compte existant ») passent par ces clés ou des clés dédiées dans `auth` / `auth.errors` (pas de texte en dur).

---

## 7. Logique métier (résumé)

- **Détection « email renvoyé »** : `data?.user?.identities?.length === 0` après un signUp réussi.
- **Détection « nouveau compte »** : signUp réussi et `identities.length > 0` (ou truthy).
- **Compte déjà confirmé** : géré par l’erreur Supabase → `handleSignupError` → `userExists` + `existingEmail` (inchangé).
- **Profil** : création uniquement pour le chemin « nouveau compte » ; pas d’insert quand `identities` vide.

---

## 8. Tests manuels recommandés

1. **Nouveau compte (email jamais utilisé)** : inscription → écran succès « Compte créé », message invitant à confirmer l’email (modale + page login).
2. **Compte existant non confirmé** : inscrire avec un email, ne pas confirmer ; réessayer une inscription avec le même email → écran succès « Email envoyé » / « Un nouvel email a été envoyé à … » (modale + page login).
3. **Compte existant confirmé** : inscription avec un email déjà confirmé → message d’erreur + bascule sur connexion avec message « Un compte existe déjà… » et email pré-rempli (modale + page login).
4. **i18n** : vérifier FR et EN pour les deux messages de succès et le bandeau « compte existant ».
5. **Rate limit** : comportement inchangé (message d’erreur existant).

---

## 9. Points à trancher en implémentation

- **Message « email renvoyé »** : soit une seule clé i18n avec placeholder `{email}`, soit une clé sans variable et affichage de l’email à côté dans le composant (au choix dev).
- **Réutilisation page login** : soit un sous-composant partagé (ex. `SignupSuccessScreen`) utilisé par la modale et la page, soit duplication minimale de la logique d’affichage (à trancher selon préférence projet).
- **Vue login « compte existant »** : le message au-dessus du formulaire peut être une clé dédiée (ex. `auth.accountExistsLoginMessage`) ou réutiliser `auth.errors.userExists` ; à aligner avec le design (bandeau info, pas style erreur).

---

## 10. Checklist avant livraison Architecte

- [x] Migrations / BDD : aucun changement
- [x] RLS : aucune modification
- [x] Table des fichiers présente (actions, i18n, LoginForm, page login)
- [x] Cas limites : identities vide vs non vide, pas d’insert profil si email renvoyé
- [x] Tests manuels recommandés listés
- [x] Points à trancher en implémentation indiqués
