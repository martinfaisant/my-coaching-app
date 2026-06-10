# 🏃‍♂️ My Sport Ally - Plateforme de Coaching Sportif

Application web de coaching sportif connectant athlètes et coachs professionnels.

## 📋 Description

My Sport Ally est une marketplace + plateforme de coaching permettant aux athlètes de :
- Trouver un coach facilement (filtres par sport, langue)
- Suivre un programme d'entraînement structuré
- Suivre leurs progrès et objectifs
- Communiquer avec leur coach via messagerie intégrée
- Synchroniser leurs activités Strava

Les **visiteurs et utilisateurs** peuvent contacter le support via la page publique **Contact** (`/contact`), avec accusé de réception (référence MSA) et notification e-mail côté équipe (voir variables Resend ci-dessous). Les utilisateurs **connectés** qui ouvrent l’accueil marketing **`/`** ou **`/en`** sont **redirigés** vers la page d’entrée du tableau de bord selon leur rôle (détail : **Project_context.md** §4.0, code **`lib/dashboardEntryPath.ts`**).

## 🚀 Quick Start

### Prérequis

- Node.js 18+ 
- npm ou yarn
- Compte Supabase (base de données + auth)

### Installation

```bash
# Cloner le repo
git clone <url-du-repo>
cd my-coaching-app

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
```

### Variables d'environnement (.env.local)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_publique
# Secret « service_role » (dashboard Supabase → API) — nom préféré côté app :
SUPABASE_SECRET_KEY=votre_cle_service_role
# Alternative acceptée : SUPABASE_SERVICE_ROLE_KEY (même valeur)

# Resend — formulaire contact (envoi vers support@mysportally.com, Reply-To = e-mail visiteur)
# Obligatoire : nom exact RESEND_API_KEY (sans guillemets superflus). Alias toléré : RESEND_KEY.
RESEND_API_KEY=re_xxxxxxxx
# Optionnel : surcharger destinataire / expéditeur (défauts : support@mysportally.com, no-reply@mysportally.com)
# CONTACT_SUPPORT_TO=support@mysportally.com
# CONTACT_EMAIL_FROM=My Sport Ally <no-reply@mysportally.com>

# Strava (optionnel - pour import d'activités)
STRAVA_CLIENT_ID=votre_client_id
STRAVA_CLIENT_SECRET=votre_client_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000  # en production : https://mysportally.com

# Cron Vercel : clôture des souscriptions à échéance (route /api/cron/process-expired-subscriptions)
# Générer une valeur aléatoire ; même valeur dans Vercel (CRON_SECRET) pour les invocations planifiées.
CRON_SECRET=votre_secret_aleatoire

# Stripe — abonnement plateforme coach (Checkout + webhooks)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
# Price ID(s) du produit d’abonnement coach (Dashboard Stripe → Produit → Prix récurrent). Un seul ID ou plusieurs séparés par des virgules ou des espaces.
STRIPE_COACH_PLATFORM_PRICE_ID=price_...
# Optionnel : plusieurs prix (ex. mensuel + annuel). Si défini, remplace la lecture d’un seul ID pour la vitrine « Mon Abonnement ».
# STRIPE_COACH_PLATFORM_PRICE_IDS=price_xxx,price_yyy
# Optionnel : essai gratuit sur les nouvelles souscriptions (nombre de jours, ex. 90). 0 ou absent = pas d’essai. Un coach ne peut bénéficier qu’une fois par campagne (table coach_platform_trial_consumptions, migration 075 ; enregistrement webhook + retour Checkout verify). Retirer la campagne : mettre TRIAL_DAYS à 0 puis redéployer.
# COACH_PLATFORM_SUBSCRIPTION_TRIAL_DAYS=90
# Optionnel : identifiant stable de la campagne essai (ex. launch-2026-v1). Si absent alors que TRIAL_DAYS > 0, fallback `platform-default`.
# COACH_PLATFORM_SUBSCRIPTION_TRIAL_CAMPAIGN_ID=launch-2026-v1
# Libellés FR/EN des cartes (page + modale avant Checkout) : `messages/fr.json` & `en.json` → `coachMsaOffers.byPriceId` (une entrée par `price_…` : `title`, `description`, optionnel `tagline`, `features[]` ; repli sur nom/description Stripe). Page Mon abonnement : tuile abo + Gérer (résiliation) si `active`/`trialing` ; bannière impayé si `past_due`/`unpaid` ; grille offres masquée tant que l’abo est géré ou impayé.
# URL publique de l’app (repli si l’hôte de la requête n’est pas autorisé pour Stripe Checkout) : NEXT_PUBLIC_SITE_URL ou, à défaut, NEXT_PUBLIC_APP_URL. En preview Vercel, les success/cancel URL utilisent l’hôte courant (*.vercel.app) lorsque les en-têtes le permettent — voir `lib/checkoutReturnOrigin.ts`.
# Comportement Checkout : `ensureCoachPlatformStripeCustomerForCheckout` (`lib/stripeCoachPlatformCustomer.ts`) résout ou crée le Customer `cus_…` (base → liste Stripe par e-mail + `metadata.coach_id` → création), met à jour `preferred_locales` selon la locale du portail (`/fr` / `/en`) et `Customer.name` à partir du prénom/nom profil (`formatCoachPlatformStripeCustomerName`), puis ouvre Checkout avec `customer` + `locale` de session. Après sauvegarde Mon profil, un coach avec `stripe_customer_id` déclenche `syncCoachPlatformStripeCustomerNameIfPresent` (sans bloquer le save si Stripe échoue). E-mail profil coach obligatoire.
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Resend (formulaire contact)

- L’adresse d’expéditeur (**From**, défaut `no-reply@mysportally.com`) doit correspondre à un **domaine vérifié** dans le dashboard Resend. Sinon l’API refuse l’envoi (souvent HTTP 403) : tu peux ne rien voir côté « Emails » comme envoi réussi.
- **Tests sans domaine** : utiliser par exemple `CONTACT_EMAIL_FROM=My Sport Ally <onboarding@resend.dev>` et, si ton compte est en mode test, un **To** autorisé (souvent ton propre e-mail), via `CONTACT_SUPPORT_TO=...`.
- En développement, un échec Resend est journalisé côté serveur sous `Resend contact email failed` (statut HTTP + extrait de la réponse dans l’erreur).

### Lancer en développement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

### Build de production

```bash
npm run build
npm start
```

## 🌐 Internationalisation (bilingue FR/EN)

L'application est **bilingue** (français par défaut, anglais). Toute nouvelle feature doit être traduite dès le départ via next-intl (`messages/fr.json`, `messages/en.json`). Voir **[docs/I18N.md](./docs/I18N.md)** pour la référence complète et la checklist nouvelles features.

## 🔧 Stack Technique

- **Framework:** Next.js 16 (App Router)
- **Langage:** TypeScript (strict mode)
- **UI:** Tailwind CSS + Design System custom
- **i18n:** next-intl (FR/EN)
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **Déploiement:** Vercel (recommandé)

## 📚 Documentation

- **[Project_context.md](./Project_context.md)** - Vision produit, rôles, features
- **[docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md)** - Design system complet
- **[docs/I18N.md](./docs/I18N.md)** - Internationalisation (bilingue), checklist nouvelles features
- **[DOCS_INDEX.md](./DOCS_INDEX.md)** - Index de toute la documentation
- **[.cursor/rules/project-core.mdc](./.cursor/rules/project-core.mdc)** - Conventions de code

## 🎨 Design System

Le projet utilise un design system cohérent avec :
- **Palette de couleurs** : Tons forêt/olive/or (palette nature)
- **Composants réutilisables** : `Button`, `Input`, `Textarea`, `Badge`, `Modal`, `DashboardPageShell`
- **Design tokens** : Définis dans `tailwind.config.ts`

Voir [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md) pour tous les détails.

## 🔐 Authentification & Rôles

### 3 rôles utilisateur :

**Athlète**
- Chercher un coach et envoyer une demande (avec choix d’une offre ; l’offre est figée au moment de la demande) ; sur la page **Trouver mon coach**, consulter la **liste des avis** d’un coach (note et commentaire ; pas d’identité des noteurs)
- Chatter avec les coachs liés par demande (`pending`/`accepted`) ; certaines conversations peuvent être en lecture seule selon le statut
- Consulter son calendrier d'entraînement
- Consulter ses **statistiques** de volume réalisé (`/dashboard/stats` : années, sport, courbe Nivo, même logique « fait » que le calendrier)
- Gérer ses objectifs
- Noter son coach
- Synchroniser Strava

**Coach**
- Créer un profil professionnel et des offres (statuts : brouillon → en ligne → archivée)
- Recevoir des demandes, accepter ou refuser ; à l’acceptation une souscription active est créée (données d’offre figées)
- Chatter avec les athlètes dès la demande `pending` ; après fin de droit d'écriture, l'historique reste lisible (lecture seule)
- Gérer ses athlètes
- Rédiger des notes privées sur le calendrier d’un athlète (onglet Notes) — invisibles pour l’athlète
- Créer des entraînements
- Consulter les totaux hebdomadaires
- Communiquer avec les athlètes

**Admin**
- Gérer les membres et rôles
- Accéder au design system (`/dashboard/admin/design-system`)

## 📦 Offres et souscriptions

- **Offres** : chaque coach a des offres avec statut **brouillon** (invisible aux athlètes), **en ligne** (visibles, au plus 3), ou **archivée** (plus de nouvelles demandes). En ligne, seul le titre/description restent modifiables (prix et type figés).
- **Demande** : l’athlète envoie une demande en choisissant une offre ; le serveur enregistre un **snapshot** (titre, description, prix) dans `coach_requests`. Si le coach modifie l’offre ensuite, la demande ne change pas.
- **Acceptation** : quand le coach accepte, une **souscription** est créée en recopiant les données figées de la demande (pas depuis l’offre actuelle). Les souscriptions existantes ne sont pas modifiées si le coach change ou archive une offre.

Détails complets : [Project_context.md](./Project_context.md) (sections 4.4 et 5).

## 🔗 Intégration Strava

### Configuration

1. Créer une app sur [Strava API](https://www.strava.com/settings/api)
2. Récupérer **Client ID** et **Client Secret**
3. Configurer **Authorization Callback Domain** :
   - Local : `localhost`
   - Production : `mysportally.com` (voir [docs/DOMAIN_MYSPORTALLY_SETUP.md](./docs/DOMAIN_MYSPORTALLY_SETUP.md))
4. Ajouter dans `.env.local` :
   ```bash
   STRAVA_CLIENT_ID=votre_client_id
   STRAVA_CLIENT_SECRET=votre_client_secret
   NEXT_PUBLIC_APP_URL=http://localhost:3000   # en production : https://mysportally.com
   ```

### Utilisation

Les athlètes peuvent lier leur compte Strava via **Profil → Mes appareils connectés** pour importer automatiquement leurs activités dans le calendrier.

## 📁 Structure du Projet

```
my-coaching-app/
├── app/                      # Next.js App Router
│   ├── [locale]/             # Routes localisées (FR/EN)
│   │   ├── dashboard/       # Pages principales
│   │   │   ├── calendar/   # Calendrier d'entraînement
│   │   │   ├── objectifs/  # Gestion des objectifs
│   │   │   ├── profile/    # Profil utilisateur
│   │   │   └── ...
│   │   ├── admin/          # Pages admin
│   │   ├── login/          # Authentification
│   │   └── page.tsx        # Landing
│   ├── api/                # API routes (Strava, etc.)
│   └── auth/               # Auth callbacks
├── i18n/                    # Config next-intl
├── messages/                # fr.json, en.json
├── components/             # Composants réutilisables
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   ├── DashboardPageShell.tsx
│   └── ...
├── lib/                    # Utilitaires et helpers
│   ├── dateUtils.ts
│   ├── stringUtils.ts
│   ├── authHelpers.ts
│   ├── sportStyles.ts
│   ├── errors.ts
│   └── logger.ts
├── utils/                  # Clients Supabase
│   ├── supabase/
│   └── auth.ts
├── docs/                   # Documentation
│   ├── DESIGN_SYSTEM.md
│   ├── I18N.md            # Référence bilingue FR/EN
│   ├── PATTERN_SAVE_BUTTON.md
│   └── archive/           # Docs archivés (historique)
└── proxy.ts               # Middleware d'authentification
```

## 🧪 Tests

```bash
# Quality gate local
npm run check

# TypeScript uniquement
npm run typecheck

# Lint (auto-fix)
npm run lint:fix

# Build de vérification
npm run build
```

> Note : Les tests unitaires et E2E sont à implémenter (voir P3 de l'audit)

## 🚢 Déploiement

**Production :** l’application est déployée en production sur **https://mysportally.com** (Vercel + domaine custom). Configuration détaillée : [docs/DOMAIN_MYSPORTALLY_SETUP.md](./docs/DOMAIN_MYSPORTALLY_SETUP.md).

### Vercel (recommandé)

1. Connecter le repo à Vercel
2. Configurer les variables d'environnement (voir `.env.local` ; en prod : `NEXT_PUBLIC_SITE_URL` et `NEXT_PUBLIC_APP_URL` = `https://mysportally.com`)
3. Déployer automatiquement à chaque push

Voir [DEPLOYMENT_NOTES.md](./DEPLOYMENT_NOTES.md) et [MISE_EN_PROD.md](./MISE_EN_PROD.md) pour plus de détails.

## 📊 État du Projet

**Score qualité actuel : 8.3/10**

### Refactorings complétés (13/17 tâches) ✅

- ✅ P0 : Utilitaires centralisés (date, string, auth, validation)
- ✅ P1 : Composants cohérents (modals, layouts, styles)
- ✅ P2 : Optimisations (SEO, loading, documentation, logger)

### À venir (P3 - optionnel)

- Tests unitaires et E2E
- Optimisations performance avancées
- Améliorations accessibilité

Voir [DOCS_INDEX.md](./DOCS_INDEX.md) et [docs/archive/](./docs/archive/) pour l'historique.

## 🤝 Contribuer

1. Lire [Project_context.md](./Project_context.md) et [.cursor/rules/project-core.mdc](./.cursor/rules/project-core.mdc)
2. Suivre les conventions du design system et **penser bilingue** pour toute nouvelle feature ([docs/I18N.md](./docs/I18N.md))
3. Utiliser les composants existants
4. Respecter la philosophie MVP-first
5. Avant livraison, vérifier la Definition of Done dans `AGENTS.md` (section 6)

## 📞 Support

Pour toute question sur l'architecture ou les conventions, consulter :
- [DOCS_INDEX.md](./DOCS_INDEX.md) - Index de toute la doc
- [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md) - Composants et styles
- [docs/I18N.md](./docs/I18N.md) - Internationalisation (bilingue FR/EN)
- Historique et refactorings : [docs/archive/](./docs/archive/)

---

**Dernière mise à jour :** 13 mai 2026 (Stripe coach : **`Customer.name`** + doc Analyste ; précédent : 5 mai 2026)  
**Version :** 1.0.0  
**License :** MIT
