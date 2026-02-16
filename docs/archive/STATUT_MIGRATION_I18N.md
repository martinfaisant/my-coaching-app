# Statut de migration i18n - Vue d'ensemble

**Date** : 15 février 2026  
**Framework** : next-intl v3.x  
**Locales** : FR (défaut) / EN

---

## ✅ Pages et composants COMPLÈTEMENT MIGRÉS

### 1. Authentification
- ✅ **LoginForm** (components/LoginForm.tsx)
- ✅ **AuthButtons** (components/AuthButtons.tsx)
- ✅ **Sidebar** (components/Sidebar.tsx)
- ✅ **Login page** (app/[locale]/login/page.tsx)
- ✅ **Reset password** (app/[locale]/reset-password/page.tsx)
- **Namespace** : `auth` (17 clés)

### 2. Mon offre (Offres coach)
- ✅ **OffersForm** (app/[locale]/dashboard/profile/offers/OffersForm.tsx)
- ✅ **Offers page** (app/[locale]/dashboard/profile/offers/page.tsx)
- ✅ **Offers actions** (app/[locale]/dashboard/profile/offers/actions.ts)
- **Namespace** : `offers` (19 clés)
- **Documentation** : `MIGRATION_OFFRES_COMPLETE.md`

### 3. Mes athlètes (Dashboard principal)
- ✅ **Dashboard page** (app/[locale]/dashboard/page.tsx) - 3 cas d'usage (athlète/coach/admin)
- ✅ **FindCoachSection** (app/[locale]/dashboard/FindCoachSection.tsx) - Recherche + modales
- ✅ **RespondToRequestButtons** (app/[locale]/dashboard/RespondToRequestButtons.tsx)
- ✅ **Dashboard actions** (app/[locale]/dashboard/actions.ts)
- **Namespaces** : `athletes` (25 clés), `findCoach` (37 clés), `coachRequests` (10 clés)
- **Documentation** : `MIGRATION_MES_ATHLETES_COMPLETE.md`

### 4. Mon coach
- ✅ **Coach page** (app/[locale]/dashboard/coach/page.tsx)
- ✅ **CoachRatingForm** (app/[locale]/dashboard/coach/CoachRatingForm.tsx)
- ✅ **Coach actions** (app/[locale]/dashboard/coach/actions.ts)
- **Namespace** : `myCoach` (24 clés)
- **Documentation** : `MIGRATION_MON_COACH_COMPLETE.md`

### 5. Mes appareils connectés (Strava)
- ✅ **Devices page** (app/[locale]/dashboard/devices/page.tsx)
- ✅ **StravaDevicesSection** (app/[locale]/dashboard/devices/StravaDevicesSection.tsx)
- ✅ **Devices actions** (app/[locale]/dashboard/devices/actions.ts)
- **Namespace** : `devices` (21 clés)
- **Documentation** : `MIGRATION_APPAREILS_CONNECTES_COMPLETE.md`

### 6. Chat coach ↔ athlète
- ✅ **ChatModule** (components/ChatModule.tsx)
- ✅ **Chat actions** (app/[locale]/actions/chat.ts)
- **Namespace** : `chat` (10 clés)
- **Documentation** : `MIGRATION_CHAT_COMPLETE.md`

### 7. Mon profil
- ✅ **Profile page** (app/[locale]/dashboard/profile/page.tsx)
- ✅ **ProfileForm** (app/[locale]/dashboard/profile/ProfileForm.tsx)
- ✅ **Profile actions** (app/[locale]/dashboard/profile/actions.ts)
- **Namespace** : `profile` (24+ clés)
- **Statut** : Déjà migré (avant cette session)

### 8. Mes objectifs
- ✅ **Objectifs page** (app/[locale]/dashboard/objectifs/page.tsx)
- ✅ **ObjectifsTable** (app/[locale]/dashboard/objectifs/ObjectifsTable.tsx)
- ✅ **Objectifs actions** (app/[locale]/dashboard/objectifs/actions.ts)
- **Namespace** : `goals` (36 clés)
- **Statut** : Déjà migré (avant cette session)

### 9. Calendrier
- ✅ **Calendar page** (app/[locale]/dashboard/calendar/page.tsx)
- ✅ **CalendarView** (components/CalendarView.tsx)
- **Namespace** : `calendar` (55+ clés)
- **Statut** : Déjà migré (avant cette session)

---

## 🚧 Pages et composants PARTIELLEMENT MIGRÉS ou NON MIGRÉS

### Composants partagés (à vérifier)
- ❓ **WorkoutModal** (components/WorkoutModal.tsx) - Très utilisé
- ❓ **CoachAthleteCalendarPage** (components/CoachAthleteCalendarPage.tsx)
- ❓ **CalendarViewWithNavigation** (components/CalendarViewWithNavigation.tsx)

### Pages spécifiques
- ❓ **Détail athlète** (app/[locale]/dashboard/athletes/[athleteId]/page.tsx)
- ❓ **Landing page** (app/[locale]/page.tsx)
- ❓ **Admin membres** (app/[locale]/admin/members/page.tsx)
- ❓ **Admin design system** (app/[locale]/admin/design-system/page.tsx)

---

## 📊 Statistiques globales

### Pages migrées (cette session)
- ✅ Mon offre
- ✅ Mes athlètes (dashboard)
- ✅ Mon coach
- ✅ Mes appareils connectés
- ✅ Chat

### Pages déjà migrées (avant)
- ✅ Authentification
- ✅ Sidebar/Navigation
- ✅ Mon profil
- ✅ Mes objectifs
- ✅ Calendrier

### Total
- **~14 pages/sections majeures migrées**
- **~370 clés de traduction créées**
- **14 namespaces** : `auth`, `common`, `navigation`, `sports`, `workouts`, `offers`, `athletes`, `findCoach`, `coachRequests`, `myCoach`, `devices`, `chat`, `profile`, `goals`, `calendar`, `errors`, `metadata`

---

## 🎯 Prochaines étapes recommandées

### À vérifier (composants potentiellement non migrés)
1. **WorkoutModal** - Composant critique utilisé partout
2. **CoachAthleteCalendarPage** - Vue coach sur le calendrier d'un athlète
3. **Landing page** - Page d'accueil publique
4. **Admin** - Pages d'administration

### Tests end-to-end recommandés
1. Parcours athlète complet (FR + EN)
2. Parcours coach complet (FR + EN)
3. Recherche et demande de coach
4. Import Strava
5. Chat en temps réel

---

**📝 Note** : La majorité des pages principales sont déjà migrées ! Les namespaces `calendar`, `profile`, `goals` étaient déjà créés et utilisés avant cette session.
