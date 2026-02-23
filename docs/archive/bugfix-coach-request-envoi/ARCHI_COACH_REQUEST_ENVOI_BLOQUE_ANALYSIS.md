# Analyse architecture – Demande coach bloquée à « Envoi en cours »

**Contexte (Mode Architecte)**  
L’athlète envoie une demande à un coach (avec choix d’une offre). Au clic sur « Envoyer la demande », l’UI reste sur « Envoi en cours… » et la demande ne se valide jamais.

---

## 1. Flux actuel

| Étape | Fichier / couche | Comportement |
|-------|------------------|--------------|
| 1 | `FindCoachSection.tsx` – `CoachDetailModal` | Clic « Envoyer la demande » → `handleSubmit` : `setIsSubmitting(true)` puis `await createCoachRequest(coach.user_id, sports, need.trim(), selectedOfferId, locale)` |
| 2 | `app/[locale]/dashboard/actions.ts` – `createCoachRequest` | Server action : auth, validation, lecture offre (si `offerId`), construction payload, `supabase.from('coach_requests').insert(insertPayload)`, mise à jour `profiles.practiced_sports`, `revalidatePath`, return `{}` ou `{ error }` |
| 3 | Client | `setIsSubmitting(false)` puis si `result.error` → `setError(result.error)` sinon `router.refresh()` + `onClose()` |

**Point critique** : `setIsSubmitting(false)` n’est exécuté qu’**après** le `await createCoachRequest(...)`. Si la promise ne se résout jamais (rejet ou attente infinie), l’UI reste sur « Envoi en cours ».

---

## 2. Hypothèses de cause

### 2.1 Server action qui **throw** (rejet de la promise)

Si une exception est levée dans `createCoachRequest` sans être capturée, la promise rejette. Côté client, le `await` lève à son tour, et tout code après (dont `setIsSubmitting(false)`) n’est pas exécuté.

**Sources possibles côté serveur :**
- `getTranslations(...)` (next-intl) en cas de locale/namespace manquant ou erreur de config
- Erreur non gérée dans une dépendance (Supabase, auth)
- Erreur de sérialisation du retour de l’action (Next.js)

### 2.2 Server action qui **ne retourne jamais** (hang)

- Timeout réseau ou Supabase
- Boucle ou attente infinie (peu probable au vu du code actuel)

### 2.3 Insert refusé par la base (RLS / contrainte)

Dans ce cas, `supabase.from('coach_requests').insert(...)` renvoie `{ error }`. Le code actuel fait `if (error) return { error: tErrors('supabaseGeneric') }` : l’action **retourne** donc une erreur, la promise se résout, et le client devrait recevoir `result.error` et afficher le message. Donc un simple refus d’insert (RLS, contrainte) ne suffit pas à expliquer un blocage à « Envoi en cours » **sauf** si l’erreur de l’action n’est pas correctement renvoyée au client (ex. sérialisation, edge case Next.js).

**Conclusion** : la cause la plus cohérente avec « reste à Envoi en cours » est soit une **exception non gérée** dans l’action (2.1), soit un **hang** (2.2). En pratique, une **exception non gérée** est la piste prioritaire.

---

## 3. RLS et schéma (vérification rapide)

- **INSERT** `coach_requests` : politique `coach_requests_insert_athlete` (008) – `athlete_id = auth.uid()` et `coach_id IN (SELECT user_id FROM profiles WHERE role = 'coach')`. Cohérent avec le flux.
- Colonnes utilisées dans l’insert (039, 040, 042) : `offer_id`, `frozen_price`, `frozen_price_type`, `frozen_title`, `frozen_description`, `frozen_title_fr`, `frozen_title_en`, `frozen_description_fr`, `frozen_description_en` – présentes en BDD.
- Pas de conflit évident entre le payload et le schéma/RLS pour expliquer un blocage sans message d’erreur, **sauf** si l’échec d’insert déclenche une exception au lieu d’un `return { error }` dans un code path non couvert.

---

## 4. Recommandations

### 4.1 Côté client (FindCoachSection – CoachDetailModal)

- **Robustesse** : s’assurer que le chargement se termine toujours, même en cas d’erreur ou de rejet.
  - Entourer l’appel à `createCoachRequest` dans un `try / catch / finally`.
  - Dans un `finally`, appeler systématiquement `setIsSubmitting(false)`.
  - En `catch`, afficher un message d’erreur générique (namespace `errors`, ex. `somethingWentWrong` ou `tryAgain`) pour que l’utilisateur comprenne qu’une erreur s’est produite au lieu de rester sur « Envoi en cours ».

### 4.2 Côté serveur (createCoachRequest)

- **Ne jamais laisser l’action throw** vers le client : encapsuler le corps de l’action dans un `try/catch` global.
  - En cas d’exception : logger avec `logger.error` (contexte : `createCoachRequest`, erreur + stack si dispo).
  - Retourner `{ error: tErrors('supabaseGeneric') }` (ou une clé dédiée du type `errors.somethingWentWrong`) pour que le client reçoive toujours un objet `{ error?: string }` et puisse réafficher le formulaire avec un message.
- **Log explicite en cas d’échec d’insert** : lorsque `insert` renvoie `error`, faire `logger.error('createCoachRequest insert failed', error, { coachId, offerId })` avant le `return { error: tErrors('supabaseGeneric') }`, pour faciliter le diagnostic (RLS, contrainte, etc.) sans exposer de détail à l’utilisateur.

### 4.3 Optionnel – RequestCoachButton

Le même scénario (demande sans offre, 3 arguments) utilise `useTransition` et `startTransition`. En cas de rejet de la promise, `isPending` peut rester à `true`. Appliquer la même logique : `try/finally` (ou équivalent) pour réinitialiser l’état de chargement, et `catch` pour afficher une erreur générique.

---

## 5. Table des fichiers

| Fichier | Rôle | Action |
|---------|------|--------|
| `app/[locale]/dashboard/FindCoachSection.tsx` | Modal « Envoyer la demande » avec offre | Modifier : `handleSubmit` avec try/catch/finally, toujours `setIsSubmitting(false)`, afficher erreur en catch |
| `app/[locale]/dashboard/actions.ts` | `createCoachRequest` | Modifier : try/catch global, log en cas d’exception et en cas d’erreur insert, retourner toujours `{ error? }` |
| `app/[locale]/dashboard/RequestCoachButton.tsx` | Demande sans offre (useTransition) | Optionnel : gérer rejet (try/catch/finally) pour ne pas rester en « Envoi en cours » |

---

## 6. Tests manuels recommandés

1. **Cas nominal** : athlète, une offre publiée, envoyer la demande → succès, modale se ferme, liste/état à jour.
2. **Erreur volontaire** : temporairement casser l’action (ex. `throw new Error('test')` en début d’action) → vérifier que l’UI ne reste pas sur « Envoi en cours », qu’un message d’erreur s’affiche et que le bouton redevient cliquable.
3. **Insert refusé** : ex. désactiver la politique RLS INSERT pour tester (ou contrainte violée) → vérifier que le message générique s’affiche et que les logs serveur contiennent l’erreur Supabase.
4. **RequestCoachButton** (sans offre) : envoyer une demande sans offre, puis (si modif faite) simuler une erreur → pas de blocage sur « Envoi en cours ».

---

## 7. Points à trancher en implémentation

- **Clé i18n en catch** : réutiliser `errors.somethingWentWrong` / `errors.tryAgain` ou ajouter une clé dédiée (ex. `errors.requestSendFailed`) selon la convention projet (`docs/I18N.md`).
- **Niveau de détail des logs** : en prod, ne pas logger de données personnelles (ex. éviter de logger `coaching_need` ou des identifiants en clair) ; garder `coachId`, `offerId`, code d’erreur Supabase.

---

**Document** : Analyse architecture (Mode Architecte)  
**Date** : 2026-02-22  
**Objectif** : Corriger le blocage « Envoi en cours » et renforcer la robustesse + observabilité du flux d’envoi de demande coach.
