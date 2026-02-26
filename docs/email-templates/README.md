# Templates emails Supabase

**Dernière mise à jour :** 26 février 2026

Ce dossier centralise **tous les templates HTML** des emails envoyés par Supabase (Authentication → Email Templates), pour faciliter la maintenance et la cohérence.

---

## Où configurer

Dashboard Supabase → **Authentication** → **Email Templates** → choisir le type d’email (Confirm signup, Magic Link, Reset Password, etc.).

**Pour chaque template, il faut toujours renseigner les deux champs :**
- **Subject** (sujet de l’email) : indiqué en en-tête de chaque fichier `.html` de ce dossier (commentaire au début du fichier) ou dans [AUTH_EMAIL_TEMPLATES.md](../AUTH_EMAIL_TEMPLATES.md).
- **Body** (corps HTML) : contenu du fichier `.html` correspondant (à copier en entier à partir de `<!DOCTYPE html>`).

---

## Index des templates

| Type Supabase        | Fichier              | Statut   | Variables principales                          |
|----------------------|----------------------|----------|-------------------------------------------------|
| **Confirm signup**   | `confirm-signup.html` | À jour   | `{{ .ConfirmationURL }}`, `{{ .Data.locale }}`, `{{ .SiteURL }}` |
| **Magic Link**       | *(à créer)*          | À venir  | `{{ .ConfirmationURL }}`, `{{ .SiteURL }}`      |
| **Reset Password**   | *(à créer)*          | À venir  | `{{ .ConfirmationURL }}`, `{{ .SiteURL }}`     |
| **Change Email**     | *(à créer)*          | À venir  | Variables Supabase selon le type               |

---

## Guide complet (sujet, i18n, dépannage)

Pour la **configuration détaillée** (sujet conditionnel FR/EN, envoi de la locale au signup, dépannage logo, Site URL), voir **[docs/AUTH_EMAIL_TEMPLATES.md](../AUTH_EMAIL_TEMPLATES.md)**.

---

## Conventions

- **Subject obligatoire :** ne jamais laisser le sujet vide dans Supabase ; pour Confirm signup le sujet est en en-tête de `confirm-signup.html`, pour les autres types à définir dans chaque fichier ou dans AUTH_EMAIL_TEMPLATES.md.
- **Syntaxe** : templates Go (Supabase) — `{{ .Variable }}`, `{{ if eq .Data.locale "en" }}` …
- **Logo** : utiliser `{{ .SiteURL }}/logo.png` (PNG obligatoire en email, les SVG sont souvent bloqués).
- **Design** : couleurs design system (forest #506648, stone), même structure d’en-tête et pied de page pour tous les emails auth.
