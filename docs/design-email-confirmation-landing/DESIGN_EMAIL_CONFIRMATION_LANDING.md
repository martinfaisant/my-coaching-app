# Design – Atterrissage après confirmation d’email

**Mode :** Designer  
**Date :** 26 février 2026  
**Option validée :** **B** (modale « Email validé » avec formulaire de connexion dans la modale).  
**User stories :** `USER_STORIES_EMAIL_CONFIRMATION_LANDING.md`  
**Références :** `docs/DESIGN_SYSTEM.md`, `components/Modal.tsx`, `components/LoginModal.tsx`, `components/LoginForm.tsx`, `app/auth/callback/route.ts`

---

## 1. Synthèse du besoin

**Contexte :** Aujourd’hui, quand l’utilisateur clique sur le lien « Confirmer mon email » dans l’email d’inscription, il est redirigé vers la **page de login** (ou, en cas de succès de l’échange de code, vers le dashboard selon le callback actuel).

**Souhait PO :** Après clic sur « Confirmer mon email », l’utilisateur doit arriver sur la **page d’accueil** (landing) avec :
1. Une **modale** affichant le message : « Email validé. Vous pouvez vous connecter »
2. **En dessous** (sur la page), les **champs pour se connecter** (email, mot de passe, bouton de connexion)

Objectif : garder l’utilisateur dans l’écosystème de la landing, lui confirmer la validation de l’email et lui proposer immédiatement de se connecter sans changer de page.

---

## 2. Cas identifiés

| Cas | Description |
|-----|-------------|
| **Nominal** | Clic sur le lien de confirmation → échange de code réussi → redirection vers la page d’accueil avec paramètre (ex. `?emailConfirmed=1`) → affichage de la modale « Email validé. Vous pouvez vous connecter » + un bloc formulaire de connexion en dessous. |
| **Erreur (lien expiré / déjà utilisé)** | Le lien est invalide ou déjà consommé → le callback redirige actuellement vers `/login`. À trancher : garder cette redirection avec un message d’erreur, ou rediriger vers l’accueil avec une modale différente (ex. « Lien expiré ou déjà utilisé ») et le même bloc connexion en dessous. |
| **Limite** | Comportement selon la config Supabase (PKCE, confirmation obligatoire) : après confirmation, une session peut ou non être créée automatiquement. Le design part du principe que l’utilisateur atterrit sur la home **sans** session et doit se connecter (affichage modale + formulaire). Si une session est créée automatiquement, un cas « déjà connecté » peut être géré (ex. redirection directe vers dashboard). |

---

## 3. Questions au PO

1. **Page d’accueil** : Confirmez-vous que « page d’accueil » = la landing actuelle (`/[locale]/`) avec hero, features, etc., et **pas** la page dédiée `/login` ?

2. **Lien expiré ou déjà utilisé** : Souhaitez-vous que dans ce cas l’utilisateur arrive aussi sur la page d’accueil avec une modale différente (ex. « Lien expiré ou déjà utilisé. Vous pouvez vous connecter ci-dessous. ») et le formulaire de connexion en dessous, ou préférez-vous garder la redirection vers `/login` avec un message d’erreur classique ?

3. **Fermeture de la modale « Email validé »** : La modale doit-elle se fermer uniquement via un bouton (ex. « OK » / « Fermer »), ou aussi au clic sur l’overlay / touche Escape ? Après fermeture, le bloc « Connexion » reste visible en dessous.

4. **Bilingue** : Les textes de la modale et du bloc (« Email validé. Vous pouvez vous connecter », etc.) seront en i18n (namespace `auth` ou dédié). Pas de changement fonctionnel, juste confirmation.

---

## 4. Composants existants à utiliser / faire évoluer

- **Modal** (`components/Modal.tsx`) : **tel quel** — taille `sm` pour la modale de message seul, ou `md` si formulaire dans la modale.
- **Button** (`components/Button.tsx`) : **tel quel** — variantes `primary`, `primaryDark`, `ghost`, `muted` selon le mockup.
- **Input** (`components/Input.tsx`) : **tel quel** — champs email et mot de passe.
- **AuthButtons** / **LoginModal** (`components/AuthButtons.tsx`, `components/LoginModal.tsx`) : **à réutiliser** sur la page d’accueil ; la home affiche déjà `AuthButtons` et `LoginModal`. Pour le bloc « connexion en dessous », soit réutilisation de **LoginForm** en mode `login` seul (éventuellement sans onglet inscription), soit extraction d’un sous-composant « champs login uniquement » pour éviter la duplication.
- **Page d’accueil** (`app/[locale]/page.tsx`) : **à faire évoluer** — lecture du paramètre (ex. `emailConfirmed=1`), affichage conditionnel d’une modale succès + d’un bloc formulaire de connexion (section dédiée sous le hero ou dans le hero).
- **Formulaire** : réutilisation de `lib/formStyles.ts` (FORM_BASE_CLASSES, etc.) et de l’action `login` depuis `app/[locale]/login/actions.ts`.

---

## 5. Propositions UI (2 à 3 options)

### Option A – Modale « Email validé » + bloc connexion inline sur la page

- **Redirection :** `/[locale]/?emailConfirmed=1` (ou équivalent).
- **Modale** (taille `sm`, design system) : titre « Email validé » (ou icône check verte), message « Vous pouvez vous connecter », bouton « Fermer » ou « OK ». Fermeture aussi par overlay / Escape (comportement standard `Modal`).
- **Bloc connexion** : placé **sur la page**, juste sous la zone hero (ou dans le hero, sous les CTA), sous forme d’une **carte** (style cohérent avec la page login : fond blanc, bordure, ombre). Contenu : formulaire de connexion uniquement (email, mot de passe, bouton « Se connecter »), sans onglet inscription pour rester focalisé.
- **Composants :** Modal (tel quel), Button, Input (tels quels). Bloc connexion : réutilisation de la logique et des champs de `LoginForm` en mode login (ou composant extrait « LoginFormInline »).

**Avantages :** Message de succès bien visible ; formulaire immédiatement visible « en dessous » sans action supplémentaire.  
**Référence mockup :** section « Option A » dans `mockup-email-confirmation-landing.html`.

---

### Option B – Modale « Email validé » avec formulaire de connexion dans la modale

- **Redirection :** `/[locale]/?emailConfirmed=1`.
- **Modale** (taille `md`) : dans le **corps** : message « Email validé. Vous pouvez vous connecter » ; dans le **footer** de la modale (ou en bas du corps) : champs email + mot de passe + bouton « Se connecter ». Tout reste dans la modale ; après connexion réussie, fermeture de la modale et redirection vers le dashboard.
- **Composants :** Modal (tel quel, avec `footer` ou contenu structuré), Input, Button. Réutilisation de la logique des champs et de l’action `login` de `LoginForm`.

**Avantages :** Tout est regroupé dans une seule modale ; pas de nouveau bloc sur la page.  
**Inconvénient :** La modale est plus chargée (message + formulaire).  
**Référence mockup :** section « Option B » dans `mockup-email-confirmation-landing.html`.

---

### Option C – Modale succès puis ouverture de la LoginModal existante

- **Redirection :** `/[locale]/?emailConfirmed=1`.
- **Première modale** (taille `sm`) : « Email validé. Vous pouvez vous connecter » avec un bouton « Se connecter ». Au clic sur « Se connecter », cette modale se ferme et la **LoginModal** existante (avec onglet Connexion / Inscription) s’ouvre.
- **Composants :** Modal, Button (tel quel), AuthButtons / LoginModal (tels quels). Aucun nouveau bloc formulaire sur la page.

**Avantages :** Réutilisation maximale (LoginModal déjà présente sur la home).  
**Inconvénient :** Deux modales successives ; l’utilisateur doit cliquer une fois de plus pour voir les champs. Le formulaire n’est pas « en dessous » au sens littéral mais dans une deuxième modale.  
**Référence mockup :** section « Option C » dans `mockup-email-confirmation-landing.html`.

---

## 6. Recommandation

- **Option A** correspond le mieux à la formulation du PO : « une modale qui dit … et il y a les champs pour se connecter **en dessous** ». Message dans la modale, formulaire bien visible sur la page en dessous.
- **Option B** est un bon compromis si l’on souhaite tout garder dans la modale (une seule fenêtre).
- **Option C** est la plus légère en évolution (réutilisation de LoginModal) mais ne place pas le formulaire « en dessous » sur la page.

---

## 7. Option validée et user stories

**Option retenue par le PO :** **B** – Modale « Email validé » avec formulaire de connexion **dans** la modale.

**User stories :** Voir **`USER_STORIES_EMAIL_CONFIRMATION_LANDING.md`** dans ce dossier (US1 à US4 : redirection callback, affichage modale, connexion depuis la modale, i18n). Chaque US a des critères d’acceptation et une référence au mockup Option B.

---

## 8. Prochaines étapes

- **Mode Architecte** : À partir des user stories ci-dessus, rédiger la spec technique (redirection callback, paramètre URL, composants à créer/modifier, RLS si besoin, i18n). Points à trancher : comportement en cas d’erreur callback (lien expiré) ; comportement si session déjà créée après échange de code.
- Puis **Mode Développeur** pour l’implémentation.

---

**Mockup visuel :** `mockup-email-confirmation-landing.html` — section **Option B** pour la solution retenue.
