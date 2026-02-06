This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

### Connexion Strava (athlètes)

Pour activer l’import d’activités depuis Strava :

1. Créez une application sur [Strava API](https://www.strava.com/settings/api) et récupérez **Client ID** et **Client Secret**.
2. Définissez **Authorization Callback Domain** sur le domaine de votre app : en local `localhost`, en production votre domaine exact (ex. `mon-app.vercel.app`). En cas d’erreur « redirect_uri invalid », ajoutez `NEXT_PUBLIC_APP_URL` (voir ci‑dessous).
3. Dans `.env.local` :
   - `STRAVA_CLIENT_ID=votre_client_id`
   - `STRAVA_CLIENT_SECRET=votre_client_secret`
   - (Si erreur redirect_uri) `NEXT_PUBLIC_APP_URL=https://votre-domaine.com` — doit correspondre au domaine enregistré dans Strava.
4. Les athlètes peuvent aller dans **Profil → Mes appareils connectés** pour lier Strava et importer la dernière semaine d’activités dans le calendrier.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
