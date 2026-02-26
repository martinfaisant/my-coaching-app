# Templates emails Supabase

**Dernière mise à jour :** 26 février 2026

Ce dossier centralise **tous les templates HTML** des emails envoyés par Supabase (Authentication → Email Templates), pour faciliter la maintenance et la cohérence.

---

## Où configurer

Dashboard Supabase → **Authentication** → **Email Templates** → choisir le type d’email (Confirm signup, Magic Link, Reset Password, etc.). Coller le **Subject** et le **Body** (contenu du fichier `.html` correspondant) depuis ce dossier.

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

- **Syntaxe** : templates Go (Supabase) — `{{ .Variable }}`, `{{ if eq .Data.locale "en" }}` …
- **Logo** : utiliser `{{ .SiteURL }}/logo.png` (PNG obligatoire en email, les SVG sont souvent bloqués).
- **Design** : couleurs design system (forest #506648, stone), même structure d’en-tête et pied de page pour tous les emails auth.
