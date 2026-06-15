# Boutons auth submit — état loading (archivé)

**Feature livrée :** 15 juin 2026

| Fichier | User stories |
|---------|----------------|
| `MOCKUP_US_AUTH_SUBMIT_LOADING.html` | US-AUTH-SUBMIT-01 (connexion) + US-AUTH-SUBMIT-02 (inscription) |

**Implémentation :** `components/AuthSubmitButton.tsx` (`useFormStatus` + `Button` loading) ; page `/login`, modale `LoginForm`, `EmailValidatedModal`.

**Références cibles :** `Project_context.md` §4.1, `docs/DESIGN_SYSTEM.md` § AuthSubmitButton ; i18n `auth.loggingIn`, `auth.signingUp`.
