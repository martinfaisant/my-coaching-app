# User stories – Atterrissage après confirmation email (Option B)

**Option validée :** B – Modale « Email validé » avec formulaire de connexion **dans** la modale.  
**Référence design :** `DESIGN_EMAIL_CONFIRMATION_LANDING.md`  
**Référence mockup :** `mockup-email-confirmation-landing.html`, section **Option B**.

---

## US1 – Redirection vers la page d’accueil après confirmation email

**En tant que** utilisateur venant de cliquer sur le lien « Confirmer mon email » dans l’email d’inscription,  
**je veux** être redirigé vers la page d’accueil (landing) avec un indicateur de succès,  
**afin de** voir le message de confirmation et me connecter depuis la même page.

**Critères d’acceptation :**
- [ ] Lorsque le callback auth (`/auth/callback`) reçoit un `code` et l’échange de code pour session **réussit** (type signup ou équivalent), la redirection se fait vers la **page d’accueil** `/[locale]/` avec un paramètre indiquant la confirmation (ex. `?emailConfirmed=1`), et **non** vers `/dashboard` ni `/login`.
- [ ] La locale est conservée dans l’URL de redirection (ex. `/fr/?emailConfirmed=1`, `/en/?emailConfirmed=1`).
- [ ] Si l’échange de code **échoue** (lien expiré, déjà utilisé), le comportement reste à définir par l’architecte (redirection vers `/login` avec message d’erreur ou vers la home avec modale erreur — voir design doc § Questions au PO).

**Référence mockup :** Option B – contexte d’arrivée sur la home avec paramètre ; la modale s’affiche à l’arrivée.

**Périmètre :** Backend (route callback), aucun rôle spécifique.

**i18n :** Aucun texte nouveau pour cette US.

---

## US2 – Affichage de la modale « Email validé » avec formulaire de connexion

**En tant que** utilisateur arrivé sur la page d’accueil après avoir confirmé son email,  
**je veux** voir une modale avec le message « Email validé. Vous pouvez vous connecter » et les champs pour me connecter (email, mot de passe, bouton Se connecter),  
**afin de** comprendre que mon email est validé et me connecter sans quitter la page.

**Critères d’acceptation :**
- [ ] Lorsque la page d’accueil est chargée avec le paramètre de confirmation (ex. `?emailConfirmed=1`), une **modale** s’ouvre automatiquement.
- [ ] La modale utilise le composant **Modal** du design system, taille **md** (448px max).
- [ ] **Header** : titre « Email validé » (ou équivalent i18n), icône de succès (check vert forêt), bouton fermer (X). Fermeture possible par overlay et touche Escape (comportement standard Modal).
- [ ] **Corps** : message « Vous pouvez vous connecter » (ou équivalent i18n) ; en dessous dans la modale : champs **Email** et **Mot de passe**, bouton **Se connecter** (style primary/primaryDark).
- [ ] Les champs utilisent les composants **Input** et les styles **formStyles** (design system). Pas d’onglet Inscription dans cette modale.
- [ ] Référence visuelle : **mockup Option B** (section « Option B » dans `mockup-email-confirmation-landing.html`).

**Référence mockup :** `mockup-email-confirmation-landing.html`, section **Option B** (modale md, message + formulaire dans la modale, footer avec bouton Se connecter).

**Périmètre :** Page d’accueil `app/[locale]/page.tsx`, composant client ou wrapper pour la modale (lecture du paramètre URL, état d’ouverture).

**i18n :** Namespace `auth` (ou dédié) : clés pour « Email validé », « Vous pouvez vous connecter », labels Email / Mot de passe, « Se connecter », « Fermer » si bouton dédié. FR + EN.

---

## US3 – Connexion depuis la modale et redirection

**En tant que** utilisateur dans la modale « Email validé » après confirmation,  
**je veux** pouvoir saisir mon email et mot de passe et cliquer sur « Se connecter » pour être connecté et redirigé vers le dashboard,  
**afin de** accéder à mon espace sans repasser par la page login.

**Critères d’acceptation :**
- [ ] Le formulaire dans la modale appelle la même **action** de connexion que la page login (réutilisation de `login` depuis `app/[locale]/login/actions.ts`).
- [ ] En cas de **succès** : la modale se ferme, l’utilisateur est redirigé vers le dashboard (comportement identique à la connexion depuis la page login).
- [ ] En cas d’**erreur** (identifiants incorrects, etc.) : un message d’erreur s’affiche **dans la modale** (sans redirection) ; les messages d’erreur sont issus de l’i18n existant (`auth.errors` ou équivalent).
- [ ] Pas de double soumission (bouton désactivé ou état loading pendant la requête, selon le pattern du projet).

**Référence mockup :** Option B – formulaire dans la modale ; le comportement après clic « Se connecter » n’est pas illustré dans le mockup (flux standard login).

**Périmètre :** Composant modale (client), action `login` existante.

**i18n :** Réutilisation des clés existantes pour les erreurs de connexion.

---

## US4 – Internationalisation (FR/EN) des textes de la modale

**En tant que** utilisateur francophone ou anglophone,  
**je veux** voir les textes de la modale « Email validé » et du formulaire dans ma langue,  
**afin de** comprendre le message et me connecter dans ma langue préférée.

**Critères d’acceptation :**
- [ ] Tous les textes visibles de la modale (titre « Email validé », message « Vous pouvez vous connecter », labels des champs, bouton « Se connecter », aria-label du bouton fermer) sont issus de l’i18n (next-intl), **aucun texte en dur**.
- [ ] Les clés sont présentes dans `messages/fr.json` et `messages/en.json` (namespace `auth` ou dédié selon convention projet).
- [ ] La locale utilisée pour afficher la modale est celle de la page (locale courante).

**Référence mockup :** Option B – libellés à remplacer par des clés i18n.

**Périmètre :** Fichiers de messages, composant modale.

**i18n :** Nouvelles clés (ex. `auth.emailValidatedTitle`, `auth.emailValidatedMessage`, etc.) ; voir `docs/I18N.md` pour la checklist.

---

## Récapitulatif pour l’Architecte

| US  | Résumé | Fichiers / zones impactés (à préciser par l’architecte) |
|-----|--------|----------------------------------------------------------|
| US1 | Callback redirige vers `/[locale]/?emailConfirmed=1` en cas de succès | `app/auth/callback/route.ts` |
| US2 | Page d’accueil affiche modale md (Email validé + formulaire) si paramètre présent | `app/[locale]/page.tsx`, nouveau composant ou wrapper client, Modal + formulaire |
| US3 | Formulaire modale appelle action login ; succès → fermeture + redirect dashboard ; erreur → message dans la modale | Composant modale, action `login` existante |
| US4 | Tous les textes en i18n FR/EN | `messages/fr.json`, `messages/en.json`, composant modale |

**Points à trancher en spec (Architecte) :**
- Comportement exact en cas d’**erreur** du callback (lien expiré / déjà utilisé) : redirection vers `/login` ou vers home avec modale erreur (voir design doc § 3 question 2).
- Si une **session** est déjà créée après échange de code (config Supabase) : redirection directe vers dashboard sans afficher la modale (à préciser en spec).

---

**Checklist Designer avant livraison :**
- [x] Design system et composants existants consultés ; Option B décrite avec composants à réutiliser.
- [x] Mockup Option B présent dans `mockup-email-confirmation-landing.html`.
- [x] Chaque user story comporte une référence au mockup (section Option B) et des critères d’acceptation vérifiables.
