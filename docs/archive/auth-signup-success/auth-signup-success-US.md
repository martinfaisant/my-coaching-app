# User stories – Succès inscription et cas « compte existant »

**Contexte :** Améliorer le feedback après création de compte (modale auth) : état succès dédié, email renvoyé, et bascule vers connexion avec message + email pré-rempli.

**Référence design :**
- `docs/auth-signup-success-mockup.html` – État succès (nouveau compte / email renvoyé)
- `docs/auth-login-existing-account-mockup.html` – Vue connexion « compte existant »
- Design system : `docs/DESIGN_SYSTEM.md` (tokens palette, Modal, Button, Input)
- i18n : `docs/I18N.md`, namespace `auth` + `auth.errors`

**Composants à utiliser tels quels :** `Modal`, `Button`, `Input` (design system).  
**Composants à faire évoluer :** `LoginForm` – gérer les états « succès inscription » (avec sous-type nouveau / email renvoyé) et « connexion avec message compte existant » + email pré-rempli.

---

## US 1 – État succès après création de compte (nouveau compte)

**En tant qu’** utilisateur venant de s’inscrire avec un nouvel email,  
**je veux** que la modale affiche un écran de succès dédié (sans formulaire),  
**afin de** comprendre que mon compte est créé et que je dois confirmer mon email.

**Critères d’acceptation :**
- Quand le serveur retourne un succès de type « compte créé » (email à confirmer), le contenu de la modale **remplace** le formulaire d’inscription par un écran succès.
- L’écran succès contient : icône de succès (check), titre court (ex. « Compte créé »), texte explicatif invitant à vérifier l’email et à se connecter après confirmation, bouton « Fermer ».
- Optionnel : court texte d’aide type « Pensez à vérifier les spams ».
- Le message affiché est traduit (i18n), pas de clé brute (ex. `auth.errors.accountCreatedSuccess` ne doit plus s’afficher ; la clé doit exister en FR et EN).
- **Référence mockup :** zone principale de `docs/auth-signup-success-mockup.html`.

**Composants design system :** `Modal` (inchangé), `Button` (Fermer). Icône check cohérente avec la palette (ex. `palette-forest-dark`, fond `palette-forest-light` ou équivalent).

---

## US 2 – État succès « email de confirmation renvoyé »

**En tant qu’** utilisateur ayant un compte existant mais non validé et venant de réessayer l’inscription,  
**je veux** voir un écran de succès indiquant qu’un nouvel email de confirmation a été envoyé,  
**afin de** savoir que je dois consulter ma boîte mail (et pas créer un autre compte).

**Critères d’acceptation :**
- Quand le backend indique « email de confirmation renvoyé » (compte existant non validé), la modale affiche le **même type** d’écran succès que US 1, avec un titre et un texte dédiés (ex. « Email envoyé » / « Un nouvel email de confirmation a été envoyé à [email]. Consultez votre boîte mail. »).
- Mise en page identique au mockup succès (icône, titre, paragraphe, bouton Fermer).
- Textes en i18n (namespace `auth` ou `auth.errors` selon convention projet).
- **Référence mockup :** bloc « Cas 2 » dans `docs/auth-signup-success-mockup.html`.

**Point implémentation :** le backend doit pouvoir distinguer « nouveau compte » vs « compte existant non confirmé, email renvoyé » (à préciser en spec Architecte).

---

## US 3 – Compte existant déjà validé → Connexion avec message et email pré-rempli

**En tant qu’** utilisateur qui tente de s’inscrire avec un email déjà utilisé et déjà confirmé,  
**je veux** être redirigé vers la vue Connexion dans la même modale, avec un message explicite et mon email déjà renseigné,  
**afin de** me connecter directement sans ressaisir mon email.

**Critères d’acceptation :**
- Quand le serveur retourne une erreur « compte existant » avec `userExists` et `existingEmail`, la modale **bascule** sur la vue Connexion (mode login) sans fermer la modale.
- La vue Connexion affiche un **message d’information** clair (ex. « Un compte existe déjà avec cet email. Connectez-vous avec votre mot de passe. ») au-dessus du formulaire (style bandeau info, pas erreur rouge).
- Le champ **email** est pré-rempli avec la valeur `existingEmail` renvoyée par le serveur (celle saisie à l’inscription).
- Le champ mot de passe reste vide ; l’utilisateur saisit uniquement son mot de passe puis soumet le formulaire de connexion.
- **Référence mockup :** `docs/auth-login-existing-account-mockup.html` (bandeau + email pré-rempli).

**Composants design system :** `Modal`, `Button`, `Input`. Bandeau info : fond et bordure cohérents avec la palette (ex. `palette-forest-light` / `palette-forest-dark` ou équivalent design system).

---

## US 4 – Aligner la page login standalone (hors modale)

**En tant qu’** utilisateur sur la page `/login` (formulaire plein écran, hors modale),  
**je veux** bénéficier des mêmes messages et du même comportement que dans la modale (succès, email renvoyé, compte existant → message + email pré-rempli sur le formulaire de connexion),  
**afin de** avoir une expérience cohérente.

**Critères d’acceptation :**
- Les mêmes états (succès création, email renvoyé, compte existant) sont gérés sur la page `app/[locale]/login/page.tsx`.
- Pour « compte existant » : affichage du formulaire de connexion avec message explicite et email pré-rempli (même logique que dans `LoginForm`).
- Pour succès : affichage d’un bloc succès (même contenu sémantique que le mockup), sans exiger une « modale » (la page peut afficher le bloc succès à la place du formulaire inscription).
- Textes via i18n ; pas de clé brute affichée.

**Référence :** même design que les mockups ; composants partagés ou logique dupliquée alignée (à trancher en implémentation).

---

## Checklist avant livraison Designer

- [x] Design system consulté (tokens, Modal, Button, Input)
- [x] Mockups créés et liés aux US (succès, login compte existant)
- [x] Chaque US liée à une zone du mockup
- [x] Composants design system à utiliser / faire évoluer indiqués
- [x] i18n mentionné (namespace, pas de texte en dur)
- [ ] Validation PO sur la variante (A recommandée) et sur la gestion du cas « email renvoyé » (backend dès cette feature ou message commun)
