# Templates email d'authentification (Supabase)

**Dernière mise à jour :** 26 février 2026

Ce document décrit comment configurer les emails d’auth Supabase (confirmation d’inscription, etc.) avec des **templates HTML** et le **bilinguisme FR/EN**. Les fichiers HTML des templates sont centralisés dans **[docs/email-templates/](email-templates/)**.

---

## Gestion des langues (FR/EN)

1. **Au signup** : l’app envoie la locale courante dans les metadata utilisateur. C’est déjà en place dans `app/[locale]/login/actions.ts` :
   - `options.data: { locale: 'fr' | 'en' }` selon la langue de la page d’inscription.

2. **Dans le template Supabase** : les templates utilisent la [syntaxe Go](https://pkg.go.dev/text/template). On peut faire :
   - `{{ .Data.locale }}` pour accéder à la locale.
   - `{{ if eq .Data.locale "en" }}` … `{{ else }}` pour afficher du texte en anglais ou en français.

3. **Où configurer** : Dashboard Supabase → **Authentication** → **Email Templates** → choisir le type (Confirm signup, Magic Link, Reset Password…). Coller le **Subject** et le **Body** (contenu du fichier `.html` correspondant depuis **[docs/email-templates/](email-templates/)**).

Si le **sujet** de l’email ne supporte pas les conditionnelles Go dans ton projet, laisse un seul sujet (ex. français) ou duplique le template côté SMTP si tu gères l’envoi toi‑même.

---

## Sujet de l’email (Subject) — Confirm signup

Tu peux utiliser une condition Go pour le sujet (si ton instance Supabase le permet) :

```
{{ if eq .Data.locale "en" }}Confirm your signup{{ else }}Confirmez votre inscription{{ end }}
```

Sinon, mets par défaut par exemple : `Confirmez votre inscription` ou `Confirm your signup`.

---

## Corps de l’email (HTML)

Le template HTML complet pour **Confirm signup** (variante B : en-tête dégradé, logo + nom centrés, bouton CTA centré, pied de page Accueil · Connexion) est dans **[docs/email-templates/confirm-signup.html](email-templates/confirm-signup.html)**.

**À faire :** ouvrir ce fichier, copier tout le contenu, et le coller dans le champ **Body** du template « Confirm signup » dans Supabase (Authentication → Email Templates).

Tous les templates d’emails Supabase (confirm signup, magic link, reset password, etc.) sont centralisés dans le dossier **[docs/email-templates/](email-templates/)** — voir le [README du dossier](email-templates/README.md) pour l’index.

**Variables Supabase utilisées (Confirm signup) :**

- `{{ .ConfirmationURL }}` : lien de confirmation (obligatoire).
- `{{ .Data.locale }}` : `"en"` ou `"fr"` selon la page d’inscription.
- `{{ .SiteURL }}` : URL du site (Auth → URL Configuration dans le dashboard). Utilisée pour l’image du logo (`{{ .SiteURL }}/logo.png`). Vérifier que **Site URL** pointe bien vers ton app (ex. `https://mysportally.com`) pour que le logo s’affiche dans l’email.

Si `locale` est absent (ancien flux), le template affiche la version française (`{{ else }}`).

---

## Dépannage : le logo ne s'affiche pas

Deux causes fréquentes :

### 1. Utiliser un PNG, pas un SVG

**Beaucoup de clients email (Outlook, certains webmails) bloquent les images SVG** pour des raisons de sécurité. Le logo doit donc être en **PNG** dans les emails.

- **À faire :** le fichier `public/logo.png` doit exister (ex. 80×80 ou 88×88 px).
- Le template dans `email-templates/confirm-signup.html` utilise déjà `{{ .SiteURL }}/logo.png`. Si tu avais encore `logo.svg` dans le template Supabase, remplace par `logo.png`.

### 2. Vérifier l’URL du site (Site URL)

Si **Site URL** dans Supabase (Authentication → URL Configuration) pointe vers `http://localhost:3000`, les images ne chargeront pas dans les vrais emails (les clients email ne peuvent pas accéder à ton localhost). En production, définir **Site URL** sur l’URL publique de l’app (ex. `https://mysportally.com`).

---

## Résumé

| Élément | Rôle |
|--------|------|
| **Signup** | Envoie `data: { locale: 'fr' \| 'en' }` dans `signUp` (déjà fait dans `login/actions.ts`). |
| **Templates** | Fichiers HTML dans **docs/email-templates/** ; copier dans Supabase → Email Templates. |
| **Subject** | Idéalement conditionnel ; sinon un seul sujet par défaut. |
| **Design** | Couleurs design system (forest #506648, stone), bouton CTA clair, mobile-friendly. |

Pour les autres emails (magic link, reset password, etc.), réutiliser la même structure et `{{ .Data.locale }}` si la locale est disponible au moment de l’envoi ; ajouter les fichiers dans **docs/email-templates/** au fur et à mesure.
