# Templates emails (Supabase Auth + transactionnels app)

**Dernière mise à jour :** 25 juin 2026

Ce dossier centralise les **templates HTML** des e-mails :

- **Supabase Auth** (Authentication → Email Templates) — confirmation, reset password, etc.
- **Application (Resend)** — e-mails transactionnels envoyés par le serveur Next.js (ex. alerte coach nouvelle demande).

---

## E-mails Supabase Auth

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
| **Reset Password**   | `reset-password.html` | À jour   | `{{ .ConfirmationURL }}`, `{{ .Data.locale }}`, `{{ .SiteURL }}`     |
| **Coach request (Resend app)** | `coaching-request-coach.html` | À jour | Placeholders `{{key}}` — rendu par `lib/coachRequestNotificationEmail.ts` ; i18n **`coachNotifications.email`** ; **non** collé dans Supabase |

---

## E-mails transactionnels (Resend, application)

Envoyés par le serveur Next.js via **`lib/resendClient.ts`** (variables **`RESEND_API_KEY`**, **`CONTACT_EMAIL_FROM`**).

| Cas d’usage | Fichier | Code |
|-------------|---------|------|
| Nouvelle demande de coaching (coach) | `coaching-request-coach.html` | `lib/coachRequestNotificationEmail.ts` (déclenché après `createCoachRequest`) |

**Configuration :** pas de dashboard Supabase — le HTML est lu depuis ce dossier par **`lib/emailTemplate.ts`**. Même charte visuelle que les e-mails auth (en-tête logo, couleurs design system). **Click tracking Resend :** recommandé **désactivé** (voir **`docs/AUTH_EMAIL_TEMPLATES.md`**).

---

## Guide complet (sujet, i18n, dépannage)

Pour la **configuration détaillée** (sujet conditionnel FR/EN, envoi de la locale au signup, dépannage logo, Site URL), voir **[docs/AUTH_EMAIL_TEMPLATES.md](../AUTH_EMAIL_TEMPLATES.md)**.

---

## Conventions

- **Subject obligatoire :** ne jamais laisser le sujet vide dans Supabase ; pour Confirm signup le sujet est en en-tête de `confirm-signup.html`, pour les autres types à définir dans chaque fichier ou dans AUTH_EMAIL_TEMPLATES.md.
- **Syntaxe** : templates Go (Supabase) — `{{ .Variable }}`, `{{ if eq .Data.locale "en" }}` …
- **Logo** : utiliser `{{ .SiteURL }}/logo.png` (PNG obligatoire en email, les SVG sont souvent bloqués).
- **Design** : couleurs design system (forest #506648, stone), même structure d’en-tête et pied de page pour tous les emails auth.
