# Migration "Mes appareils connectés" - Bilingue FR/EN ✅

**Date** : 15 février 2026  
**Statut** : ✅ Complété  
**Pattern** : next-intl (v3.x)

---

## 📋 Résumé

Migration complète de la page "Mes appareils connectés" (Strava) en bilingue français/anglais. Cette page permet aux athlètes de connecter leur compte Strava et d'importer automatiquement leurs activités.

**Note importante** : Le composant `StravaDevicesSection.tsx` était déjà migré avec `useTranslations('devices')` et le namespace `devices` existait déjà avec 18 clés. Cette migration a complété le travail en ajoutant 3 clés manquantes et en migrant les server actions.

---

## 📂 Fichiers migrés

| Fichier | Type | Lignes modifiées | Textes traduits |
|---------|------|------------------|-----------------|
| `messages/fr.json` | Traductions | +3 | Validation |
| `messages/en.json` | Traductions | +3 | Validation |
| `app/[locale]/dashboard/devices/page.tsx` | Server Component | 1 | Titre |
| `app/[locale]/dashboard/devices/StravaDevicesSection.tsx` | Client Component | 3 | Passage locale |
| `app/[locale]/dashboard/devices/actions.ts` | Server Actions | 5 | Messages d'erreur |

**Total** : 5 fichiers, 3 nouvelles clés (21 clés au total dans le namespace `devices`)

---

## 🗂️ Namespace `devices` (existant + complété)

### Clés existantes (18)

**Section principale :**
- `title` : "Appareils connectés" / "Connected devices"
- `connectStrava` : "Connecter Strava" / "Connect Strava"
- `disconnectStrava` : "Déconnecter" / "Disconnect"
- `reconnect` : "Reconnecter" / "Reconnect"
- `stravaConnected` : "Strava connecté" / "Strava connected"
- `syncActivities` : "Importer les 3 dernières semaines" / "Import last 3 weeks"
- `lastSync` : "Dernière synchronisation" / "Last sync"
- `connectedDescription` : Description connecté
- `notConnectedDescription` : Description non connecté
- `syncInProgress` : "Import en cours…" / "Importing…"
- `disconnecting` : "Déconnexion…" / "Disconnecting…"
- `disconnectConfirm` : Message de confirmation déconnexion

**Section messages (6) :**
- `messages.connected` : "Strava est connecté."
- `messages.disconnected` : "Strava déconnecté."
- `messages.importSuccess` : "Import : {count} activité(s)..."
- `messages.importComplete` : "Import terminé."
- `messages.errorInvalid`, `errorConfig`, `errorToken`, `errorSave` : Messages d'erreur OAuth

### Nouvelles clés ajoutées (3)

**Section validation (5 au total) :**
- `validation.stravaNotConnected` : "Strava non connecté." / "Strava not connected." (existant)
- `validation.cannotFetchActivities` : "Impossible de récupérer les activités Strava." / "Cannot fetch Strava activities." (existant)
- ✨ `validation.missingConfig` : "Configuration Strava manquante." / "Strava configuration missing."
- ✨ `validation.cannotRefresh` : "Impossible de rafraîchir la connexion Strava." / "Cannot refresh Strava connection."
- ✨ `validation.unauthorized` : "Non autorisé." / "Unauthorized."

---

## 🔄 Modifications techniques

### Server Component

#### `app/[locale]/dashboard/devices/page.tsx`

**Changements :**
1. Ajout du paramètre `params: Promise<{ locale: string }>`
2. Extraction de la locale : `const { locale } = await params`
3. Initialisation des traductions :
   ```typescript
   const t = await getTranslations({ locale, namespace: 'devices' })
   ```
4. Remplacement du titre hardcodé :
   - `"Mes appareils connectés"` → `{t('title')}`

### Client Component

#### `app/[locale]/dashboard/devices/StravaDevicesSection.tsx`

**État initial :** Déjà migré avec `useTranslations('devices')` ✅

**Changements :**
1. Ajout de l'import `useLocale` :
   ```typescript
   import { useTranslations, useLocale } from 'next-intl'
   ```
2. Initialisation de la locale :
   ```typescript
   const locale = useLocale()
   ```
3. Passage de `locale` aux server actions :
   ```typescript
   await syncStravaLastWeek(userId, locale)
   await disconnectStrava(userId, locale)
   ```

### Server Actions

#### `app/[locale]/dashboard/devices/actions.ts`

**Changements :**
1. Import `getTranslations` :
   ```typescript
   import { getTranslations } from 'next-intl/server'
   ```

2. **Fonction `getValidStravaToken`** (privée) :
   - Ajout paramètre `locale: string = 'fr'`
   - Initialisation : `const t = await getTranslations({ locale, namespace: 'devices.validation' })`
   - Remplacement de 3 messages :
     - `'Strava non connecté.'` → `t('stravaNotConnected')`
     - `'Configuration Strava manquante.'` → `t('missingConfig')`
     - `'Impossible de rafraîchir la connexion Strava.'` → `t('cannotRefresh')`

3. **Fonction `getStravaConnection`** (exportée) :
   - Ajout paramètre `locale: string = 'fr'`
   - Initialisation traductions si erreur
   - Remplacement : `'Non autorisé.'` → `t('unauthorized')`

4. **Fonction `syncStravaLastWeek`** (exportée) :
   - Ajout paramètre `locale: string = 'fr'`
   - Initialisation traductions en début de fonction
   - Passage de `locale` à `getValidStravaToken(supabase, userId, locale)`
   - Remplacement de 2 messages :
     - `'Non autorisé.'` → `t('unauthorized')`
     - `'Impossible de récupérer les activités Strava.'` → `t('cannotFetchActivities')`

5. **Fonction `disconnectStrava`** (exportée) :
   - Ajout paramètre `locale: string = 'fr'`
   - Initialisation traductions si erreur
   - Remplacement : `'Non autorisé.'` → `t('unauthorized')`

---

## ✅ Vérifications techniques

- [x] Aucune erreur de linter
- [x] Tous les imports `next-intl` présents
- [x] Locale passée aux server actions
- [x] Namespace `devices` cohérent entre fr.json et en.json
- [x] Clés de traduction identiques dans les 2 langues
- [x] Utilisation de `useTranslations` (client) et `getTranslations` (server)
- [x] Messages d'erreur traduits dans les validations
- [x] Passage de locale à la fonction privée `getValidStravaToken`
- [x] Fix placeholder `{count}` : appel de `t('messages.importSuccess', { count })` avec paramètre

---

## 🧪 Tests à effectuer

### Connexion Strava

**En français** : `/dashboard/devices`
- [ ] Page "Mes appareils connectés" s'affiche
- [ ] Section Strava affichée avec icône
- [ ] Bouton "Connecter Strava" affiché si non connecté
- [ ] Description : "Afficher vos activités Strava dans le calendrier."
- [ ] Clic sur "Connecter Strava" → redirection OAuth

**En anglais** : `/en/dashboard/devices`
- [ ] Page "Connected devices"
- [ ] Bouton "Connect Strava"
- [ ] Description : "Display your Strava activities in the calendar."

### État connecté

**En français** :
- [ ] Description : "Connecté — importez les 3 dernières semaines..."
- [ ] Bouton "Reconnecter"
- [ ] Bouton "Importer les 3 dernières semaines"
- [ ] Bouton "Déconnecter"
- [ ] Message succès après connexion : "Strava est connecté."

**En anglais** :
- [ ] Description : "Connected — import the last 3 weeks..."
- [ ] Boutons : "Reconnect", "Import last 3 weeks", "Disconnect"
- [ ] Message : "Strava is connected."

### Import d'activités

**En français** :
- [ ] Clic "Importer les 3 dernières semaines"
- [ ] Bouton affiche "Import en cours…" (loading)
- [ ] Message succès : "Import : X activité(s) (3 dernières semaines)."
- [ ] Ou "Import terminé." si pas de compteur
- [ ] Page se rafraîchit automatiquement

**En anglais** :
- [ ] Bouton "Importing…" pendant l'import
- [ ] Message : "Import: X activity(ies) (last 3 weeks)."
- [ ] Ou "Import completed."

### Déconnexion

**En français** :
- [ ] Clic "Déconnecter"
- [ ] Confirm dialog : "Déconnecter Strava supprimera aussi les activités déjà importées. Continuer ?"
- [ ] Annuler → reste connecté
- [ ] Confirmer → bouton "Déconnexion…" (loading)
- [ ] Message succès : "Strava déconnecté."
- [ ] Page revient à l'état non connecté

**En anglais** :
- [ ] Confirm : "Disconnecting Strava will also delete already imported activities. Continue?"
- [ ] Bouton : "Disconnecting…"
- [ ] Message : "Strava disconnected."

### Messages d'erreur

**Erreurs OAuth** (après redirect depuis Strava) :
- [ ] `?error=strava_invalid` → FR: "Connexion Strava annulée ou invalide." / EN: "Strava connection cancelled or invalid."
- [ ] `?error=strava_config` → FR: "Strava n'est pas configuré côté serveur." / EN: "Strava is not configured on the server."
- [ ] `?error=strava_token` → FR: "Échec de l'échange du code Strava." / EN: "Failed to exchange Strava code."
- [ ] `?error=strava_save` → FR: "Échec de l'enregistrement de la connexion." / EN: "Failed to save connection."

**Erreurs server actions** (rares, testables en simulant) :
- [ ] Token expiré sans refresh possible → FR: "Impossible de rafraîchir la connexion Strava." / EN: "Cannot refresh Strava connection."
- [ ] Config manquante → FR: "Configuration Strava manquante." / EN: "Strava configuration missing."
- [ ] Non autorisé → FR: "Non autorisé." / EN: "Unauthorized."
- [ ] Échec fetch activités → FR: "Impossible de récupérer les activités Strava." / EN: "Cannot fetch Strava activities."

---

## 📊 Complexité

**Niveau** : 4/10 (page simple avec API externe)

**Raisons :**
- Page déjà partiellement migrée (composant client complet)
- Logique métier simple (connexion OAuth, import, déconnexion)
- Namespace existant avec 18/21 clés
- Peu de textes hardcodés restants
- Intégration avec API Strava bien isolée

---

## 📚 Références

- Pattern de migration : `MIGRATION_OFFRES_COMPLETE.md`, `MIGRATION_MES_ATHLETES_COMPLETE.md`, `MIGRATION_MON_COACH_COMPLETE.md`
- Documentation i18n : `I18N_IMPLEMENTATION.md`
- Namespace `devices` réutilisé et complété
- Documentation Strava OAuth : [Strava API](https://developers.strava.com/)

---

## 🎯 Prochaines étapes

Autres pages à migrer (ordre de priorité) :

1. **Calendrier** (`app/[locale]/dashboard/calendar/page.tsx`)
   - ~40 textes (jours, mois, boutons, navigation)
   - Composant `CalendarView` partagé
   - Page complexe avec gestion de semaines

2. **Profil** (`app/[locale]/dashboard/profile/page.tsx`)
   - ~30 textes (formulaire, labels, validations)
   - Pattern similaire à Mon coach

3. **Objectifs** (`app/[locale]/dashboard/objectifs/page.tsx`)
   - ~25 textes (formulaire, liste, badges)
   - Gestion de courses/compétitions

4. **Détail athlète** (`app/[locale]/dashboard/athletes/[athleteId]/page.tsx`)
   - Peu de textes (délègue à `CoachAthleteCalendarPage`)

---

## 🔍 Notes techniques

### OAuth Strava

Le flux OAuth Strava n'est pas impacté par la migration i18n car :
- Les messages d'erreur OAuth sont gérés dans `StravaDevicesSection` (déjà traduit)
- L'API route `/api/auth/strava` n'affiche pas de texte à l'utilisateur
- Les redirects après OAuth préservent la locale dans l'URL

### Gestion des tokens

La fonction privée `getValidStravaToken` :
- Refresh automatiquement le token si expiré (5 min de buffer)
- Utilise les messages traduits en cas d'erreur
- Est appelée par `syncStravaLastWeek` qui passe la locale

### Import d'activités

- Importe les 3 dernières semaines (configurable via `threeWeeksAgo`)
- Mappe les types Strava vers nos `SportType` (`course`, `velo`, `natation`, etc.)
- Upsert en base (`onConflict: 'athlete_id,source,external_id'`)
- Revalide les paths `/dashboard` et `/dashboard/devices`

---

**✅ Migration "Mes appareils connectés" complétée avec succès !**
