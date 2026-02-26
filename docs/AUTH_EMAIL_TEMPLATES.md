# Templates email d'authentification (Supabase)

**Dernière mise à jour :** 25 février 2026

Ce document décrit comment configurer les emails d’auth Supabase (confirmation d’inscription) avec un **template HTML** et le **bilinguisme FR/EN**.

---

## Gestion des langues (FR/EN)

1. **Au signup** : l’app envoie la locale courante dans les metadata utilisateur. C’est déjà en place dans `app/[locale]/login/actions.ts` :
   - `options.data: { locale: 'fr' | 'en' }` selon la langue de la page d’inscription.

2. **Dans le template Supabase** : les templates utilisent la [syntaxe Go](https://pkg.go.dev/text/template). On peut faire :
   - `{{ .Data.locale }}` pour accéder à la locale.
   - `{{ if eq .Data.locale "en" }}` … `{{ else }}` pour afficher du texte en anglais ou en français.

3. **Où configurer** : Dashboard Supabase → **Authentication** → **Email Templates** → **Confirm signup**. Coller le **Subject** et le **Body** (HTML) ci‑dessous.

Si le **sujet** de l’email ne supporte pas les conditionnelles Go dans ton projet, laisse un seul sujet (ex. français) ou duplique le template côté SMTP si tu gères l’envoi toi‑même.

---

## Sujet de l’email (Subject)

Tu peux utiliser une condition Go pour le sujet (si ton instance Supabase le permet) :

```
{{ if eq .Data.locale "en" }}Confirm your signup{{ else }}Confirmez votre inscription{{ end }}
```

Sinon, mets par défaut par exemple : `Confirmez votre inscription` ou `Confirm your signup`.

---

## Corps de l’email (HTML)

Couleurs alignées avec le design system (forest-dark `#506648`, forest-darker, stone). À coller dans le champ **Body** du template « Confirm signup ».

```html
<!DOCTYPE html>
<html lang='{{ if eq .Data.locale "en" }}en{{ else }}fr{{ end }}'>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ if eq .Data.locale "en" }}Confirm your signup{{ else }}Confirmez votre inscription{{ end }}</title>
</head>
<body style="margin:0; padding:0; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; background-color: #fafaf9; color: #1c1917;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fafaf9;">
    <tr>
      <td style="padding: 32px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 480px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e7e5e4; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">
          <tr>
            <td style="padding: 24px 24px 20px 24px; border-bottom: 1px solid #e7e5e4;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <img src="{{ .SiteURL }}/logo.svg" alt="" width="40" height="40" style="display: block; width: 40px; height: 40px; object-fit: contain;" />
                  </td>
                  <td style="vertical-align: middle; padding-left: 12px;">
                    <span style="font-size: 18px; font-weight: 700; color: #1c1917; letter-spacing: -0.02em;">My Sport Ally</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 24px;">
              {{ if eq .Data.locale "en" }}
              <h1 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 600; color: #506648;">Confirm your signup</h1>
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.5; color: #57534e;">Thanks for signing up. Click the button below to confirm your email and activate your account.</p>
              <p style="margin: 0;">
                <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #506648; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; border-radius: 8px;">Confirm your email</a>
              </p>
              <p style="margin: 24px 0 0 0; font-size: 13px; line-height: 1.5; color: #78716c;">If you didn’t create an account, you can ignore this email.</p>
              {{ else }}
              <h1 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 600; color: #506648;">Confirmez votre inscription</h1>
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.5; color: #57534e;">Merci pour votre inscription. Cliquez sur le bouton ci-dessous pour confirmer votre adresse email et activer votre compte.</p>
              <p style="margin: 0;">
                <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #506648; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; border-radius: 8px;">Confirmer mon email</a>
              </p>
              <p style="margin: 24px 0 0 0; font-size: 13px; line-height: 1.5; color: #78716c;">Si vous n’êtes pas à l’origine de cette inscription, vous pouvez ignorer cet email.</p>
              {{ end }}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

**Variables Supabase utilisées :**

- `{{ .ConfirmationURL }}` : lien de confirmation (obligatoire).
- `{{ .Data.locale }}` : `"en"` ou `"fr"` selon la page d’inscription.
- `{{ .SiteURL }}` : URL du site (Auth → URL Configuration dans le dashboard). Utilisée pour l’image du logo (`{{ .SiteURL }}/logo.svg`). Vérifier que **Site URL** pointe bien vers ton app (ex. `https://mysportally.com`) pour que le logo s’affiche dans l’email.

Si `locale` est absent (ancien flux), le template affiche la version française (`{{ else }}`).

---

## Résumé

| Élément | Rôle |
|--------|------|
| **Signup** | Envoie `data: { locale: 'fr' \| 'en' }` dans `signUp` (déjà fait dans `login/actions.ts`). |
| **Template Supabase** | Utilise `{{ if eq .Data.locale "en" }}` … `{{ else }}` pour le texte FR/EN. |
| **Subject** | Idéalement conditionnel ; sinon un seul sujet par défaut. |
| **Design** | Couleurs design system (forest #506648, stone), bouton CTA clair, mobile-friendly. |

Pour les autres emails (magic link, reset password, etc.), tu peux réutiliser la même logique avec ` .Data.locale` si la locale est disponible dans les metadata au moment de l’envoi.
