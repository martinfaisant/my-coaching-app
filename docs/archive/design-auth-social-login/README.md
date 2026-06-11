# Design — Connexion sociale (Google OAuth)

**Statut :** livré (juin 2026) — archivé.

## Maquettes

| Fichier | Périmètre |
|---------|-----------|
| `MOCKUP_US1_LOGIN_GOOGLE_APPLE_SLOT.html` | Login avec entrée Google |
| `MOCKUP_US2_SIGNUP_GOOGLE_ENTRY.html` | Inscription via Google |
| `MOCKUP_US3_OAUTH_FINALIZE_ROLE_TERMS.html` | Finalisation rôle + CGU |
| `MOCKUP_US4_ACCOUNT_LINKING.html` | Liaison compte existant |
| `MOCKUP_US5_SIGNUP_NO_ROLE_PRESELECT.html` | Inscription sans rôle présélectionné |
| `MOCKUP_SIGNUP_MODAL_FLOW.html` | Flow modale signup |

## Implémentation (référence à jour)

- **Produit :** `Project_context.md` §4.1 Authentication
- **Déploiement :** `DEPLOYMENT_NOTES.md` § Connexion Google
- **UI :** `docs/DESIGN_SYSTEM.md` § SocialAuthButtons
- **i18n :** namespace `auth` — `docs/I18N.md`

## Écarts livré vs maquettes initiales

- **Apple** : non livré (pas de bouton).
- **Photo Google** : non importée (prénom/nom uniquement via `lib/googleUserMetadata.ts`).
