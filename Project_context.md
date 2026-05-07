# 🧠 PROJECT CONTEXT – Sport & Health Marketplace

**Production :** application en ligne sur **https://mysportally.com** (configuration domaine, Vercel, Resend : `docs/DOMAIN_MYSPORTALLY_SETUP.md`).

## 1. Product Vision

This project is a web platform that connects:

- **Athletes** (amateur or competitive)
- **Sports & health professionals:**
  - Coach (primary focus today)
  - Strength & conditioning coach, Physiotherapist, Nutritionist (future)

The goal is to build a **SIMPLE**, **ACCESSIBLE**, and **SCALABLE** product that allows athletes to:

- Find a coach easily
- Send a coaching request (with chosen offer)
- Follow a structured training program
- Track their progress
- Communicate with their coach

This is a **marketplace + coaching platform**.

The product must remain minimal and focused on real value.

---

## 2. Core Product Philosophy

Always prioritize:

- Simplicity over complexity
- MVP-first thinking
- Clean UX
- Mobile-friendly design
- Clear separation between roles (athlete, coach, admin)
- **Bilingual (FR/EN):** any new user-facing text must be translated from day one (next-intl; see `docs/I18N.md`)
- Scalable but not over-engineered architecture

Avoid:

- Over-complex systems
- Premature optimization
- Enterprise-level architecture too early
- Feature bloat

---

## 3. User Roles

### Athlete

**Can:**

- Create profile (name, avatar, practiced sports, goals)
- Search coaches (filter by sport, language, and by name / first name)
- View coach profiles and offers
- Send coaching request (with offer selection)
- Access training calendar (workouts assigned by coach)
- Track workouts (mark complete, add comments)
- Open **Statistics** (`/dashboard/stats`): compare up to **3 calendar years** of **completed volume** (« fait ») for one sport at a time (filters: sport from `ATHLETE_STATS_SPORT_OPTIONS`, week/month granularity, time / distance / elevation); line chart (Nivo) + **annual total** panel; data from `getEffectiveWeeklyTotalsFait` (same rules as calendar « fait »)
- Manage goals (races, dates)
- Manage training facilities used (type, address, opening hours)
- Chat with coach (1-to-1)
- Rate coach (1–5 stars + comment)
- Connect Strava (import activities into calendar)

**Cannot:**

- Create offers
- Create workouts for others

---

### Coach

**Can:**

- Create professional profile (name, photo, bio, coached sports, languages, postal code)
- Create offers (title, description, price, type: free / monthly / one-time)
- Receive and accept/decline coaching requests
- Manage athletes (see list, filter by name, sort by name A–Z or by planned date (nearest first); access athlete calendar)
- Create workouts for athletes (date, sport, title, description, targets)
- View athlete goals (read-only)
- View workout weekly totals and planning status
- Chat with athletes
- Receive ratings from athletes

---

### Admin

**Can (current):**

- View all members
- Manage members and roles (athlete, coach, admin) via `/dashboard/admin/members`

**Future:**

- Moderate users
- Handle disputes
- Manage platform settings

---

## 4. Core Features (Current State)

### 4.0 Dashboard (entry point) ✅

Opening `/dashboard` redirects to a **role-specific default page** (no content rendered on `/dashboard` itself):

| Role | Redirect to |
|------|-------------|
| Athlete with coach | `/dashboard/calendar` |
| Athlete without coach | `/dashboard/find-coach` |
| Coach | `/dashboard/athletes` |
| Admin | `/dashboard/admin/members` |

The dashboard uses a **top bar** (logo My Sport Ally left, nav links center on tablet/desktop, account area right). **Mobile:** page title centered, hamburger right; tap opens a **drawer from the right**. **Athlete (tablet/desktop):** **primary** links centered — if the athlete has no `coach_id`, **Find a coach** is included, then **My calendar**, **Statistics** (`/dashboard/stats`, volume « fait » charts), and **My goals**; **right:** **account menu** (avatar + name + chevron) opens a panel: connected devices, **My coach** (only when `coach_id` is set), subscription history; separator; **My details** (route `/dashboard/profile`); **Log out**. **Athlete (mobile drawer):** same grouping with horizontal separators — primary links, then secondary links, then **My details**, then **Log out** (no separate large profile card). **Coach** nav: Mes athlètes, Mon offre, Souscriptions; **profile** remains a direct top-bar link (avatar + name) to `/dashboard/profile`. **Admin** nav: Gestion des membres, Design System only (no « Mes athlètes »). The pages **« Trouver mon coach »** and **« Mes athlètes »** are separate routes (`/dashboard/find-coach`, `/dashboard/athletes`), each with its own loading skeleton. The dashboard layout and `DashboardPageShell` (padding only, no in-page title nor card container) are used for all pages. **Navigation config** is split in `lib/dashboardNavConfig.ts` (`getAthletePrimaryNavItems`, `getAthleteAccountNavItems`, `getAthleteProfileNavItem`, merged list for mobile page titles). **Stats icon** in the top bar / drawer: `components/DashboardNavIcons.tsx` (`/dashboard/stats`).

**Public / marketing / legal header:** On the **landing** (`/`), **contact** (`/contact`), **privacy** (`/privacy`), **terms** (`/terms`), and **reset-password** (`/reset-password`) routes, `PublicOrDashboardHeader` (server) renders **`PublicHeader`** when there is **no session** (logo, `LanguageSwitcher`, sign-in / sign-up), and the same **`DashboardTopBar`** as in the app when the user is **logged in** (role-based nav and account menus). The top bar is **sticky** (`sticky top-0`, `z-50`, `border-b border-stone-200`, white background) so it stays visible when scrolling long pages, consistent with the visitor header behaviour. See `docs/DESIGN_SYSTEM.md` (§ PublicOrDashboardHeader, § DashboardTopBar).

---

### 4.1 Authentication ✅

- Email/password (Supabase Auth)
- Role selection at signup (athlete or coach)
- **Legal consent at signup**: creating an account requires accepting the **Terms of Use** and **Privacy Policy** via a mandatory checkbox (modale and page login). The two documents are accessible via links that open in a **new tab** (`/terms`, `/privacy`).
- Confirmation email (Supabase template) : bilingue FR/EN via metadata locale au signup ; en-tête avec logo et nom « My Sport Ally ». Voir `docs/AUTH_EMAIL_TEMPLATES.md`.
- **Signup success (modale et page login)** : après création de compte, écran succès dédié sans formulaire (titre + message selon le cas) : **nouveau compte** (« Compte créé », inviter à confirmer l’email) ou **email de confirmation renvoyé** (compte existant non validé, message avec email). **Compte existant déjà validé** : bascule sur la vue Connexion dans la même modale/page avec message d’information et email pré-rempli. Backend distingue via `data.user.identities` (vide = email renvoyé) ; pas d’insert profil si email renvoyé.
- **Email confirmation landing** : après clic sur « Confirmer mon email » dans l’email, le callback auth redirige vers la **page d’accueil** `/[locale]/?emailConfirmed=1` (locale depuis user_metadata). Si une session est déjà créée → redirection vers le dashboard. Sinon, la page d’accueil affiche une **modale « Email validé »** (Option B) avec message et formulaire de connexion (email, mot de passe, Se connecter) ; connexion réussie → fermeture modale et redirection dashboard. En cas d’erreur du callback (lien expiré ou déjà utilisé) → redirection vers `/[locale]/login?error=confirmation_failed` avec message d’erreur. Composants : `EmailValidatedModal`, `HomeEmailConfirmedTrigger` ; voir `docs/DESIGN_SYSTEM.md` § EmailValidatedModal.
- **Password reset** : page dédiée `/[locale]/reset-password` (lien email Supabase). **En-tête :** `PublicOrDashboardHeader` — **visiteur** → `PublicHeader` (logo, LanguageSwitcher, Se connecter / Créer un compte) ; **session active** → `DashboardTopBar` (identique au dashboard). Voir `docs/DESIGN_SYSTEM.md` § PublicOrDashboardHeader, § PublicHeader.
- No OAuth in MVP (Strava is integration-only, not login)

---

### 4.2 Coach Profiles ✅

**Included:**

- Name, photo (avatar)
- Bio (presentation)
- Specialties / sports coached (course_route, trail, triathlon, velo)
- Languages (fr, en, es, de, it, pt, nl, zh)
- Postal code
- Offers (title, description, price, type)
- Display order and featured flag for offers

**Not implemented:**

- Online vs in-person
- Other professional types (physio, nutritionist)

---

### 4.2.1 Athlete profile (Mon profil) ✅

On the **Mon profil** page (`/dashboard/profile`), the athlete can edit:

- Name, avatar, postal code
- **Sports pratiqués** (practiced sports): course, vélo, natation, musculation, trail, triathlon (tiles, multi-select)

**Volumes hebdomadaires** (section title; visible only when the athlete has at least one practiced sport):

- **Volume actuel** and **Volume maximum** : two global values in **hours** (e.g. 6 and 10 h/sem.), in a **two-column layout** (same as the sport volume tiles). Saved in `profiles.weekly_current_hours` and `profiles.weekly_target_hours`. Both required when the section is shown; validation 0–168 h (no rule that current ≤ max).
- **Volume actuel par sport et par semaine** : one value per sport (manual entry), units: **km** (course, vélo), **m** (natation), **h** (musculation, triathlon). Stored in `profiles.weekly_volume_by_sport` (JSONB: keys = sport, values = number).
- **Triathlon** : when selected, the volume section shows **three tiles** (Course, Vélo, Natation) instead of one “Triathlon” tile; volumes are stored under `course`, `velo`, `natation`.
- **Trail** : no separate volume tile; when trail is selected, the **Course** tile gains an extra field **D+/sem.** (elevation gain per week in m), stored in `weekly_volume_by_sport.course_elevation_m`.
- Tiles and fields update **dynamically** when the athlete selects or deselects practiced sports (controlled checkboxes). Save uses the existing « Enregistrer » button; validation (positive values, caps) is server-side.
- **Demande de coach :** When sending a coach request, the athlete must also fill **Volumes hebdomadaires** (same section as on Mon profil: Volume actuel + Volume maximum in two columns, then volumes par sport; triathlon → 3 tuiles, trail → D+ in Course tile). These values are **saved to the athlete’s profile** on submit (before creating the request). The **coach** sees them in the pending request tile on « Mes athlètes »: two columns — **Message de l’athlète** | **Volumes hebdomadaires** (Volume actuel, Volume maximum, then volumes by sport; **always from the athlete’s current profile**, no snapshot in `coach_requests`; if empty: « Non renseigné »). The athlete sees the same block in read-only in the « Demande envoyée » modal (same design as coach view; section title outside the block, aligned with other modal titles).

**Profile page (athlete and coach):** At the bottom of the form, a **Déconnexion** (Logout) button (danger variant) is displayed above a horizontal separator and the **Supprimer mon compte** (Delete account) button. The drawer menu (mobile) also offers Logout.

**Mon profil — mobile layout:** Side margins are reduced on mobile (wrapper `-mx-3` + `DashboardPageShell` `contentClassName` `!px-2 sm:!px-6 lg:!px-8`) to avoid excessive white space. The section « Volumes hebdomadaires » uses a **responsive grid**: 2 columns for Volume actuel / Volume maximum, then 1 column below `sm`, 2 columns from `sm` for sport volume tiles. Inputs use width `6.5rem` and reduced right padding for the suffix (h/sem., km/sem., D+/sem.). Same layout and input sizes apply in the coach-request form (Volumes hebdomadaires).

---

### 4.2.2 Athlete facilities used (Mon profil) ✅

On the **Mon profil** page (`/dashboard/profile`), the athlete can manage a section **Installations utilisées / Facilities used**:

- Unlimited list of facilities (no cap).
- Each facility stores:
  - **Type**: `piscine` | `salle` | `stade` | `autre`
  - **Facility name**
  - **Address** (single field) + postal code + city + country + optional additional details
  - **Opening hours** by day (Monday to Sunday), with open/closed status and one or more time slots per day.
- Add/edit flow uses a dedicated **modal**:
  - Type selection with Segments
  - Address fields
  - Opening-hours editor (day cards + slots)
  - End time supports internal `24:00` (displayed as `00:00`).
- Save behavior:
  - Postal code is normalized at save time (uppercase + spaces removed), without imposing input constraints in the form.
  - Server-side validation checks opening-hours structure (days present, open/closed consistency, `start < end`, no overlapping slots).
- Profile display behavior:
  - Facility card shows **Edit** and **Delete** (same layout for address + opening hours as below).
  - Two-column layout: address/details on the left, opening hours on the right.
  - No dedicated empty-state card: when no facility exists, only section header and add button are shown.

**Coach — athlete calendar (`/dashboard/athletes/[athleteId]`):** **Access:** the logged-in user must be a **coach** and the athlete’s `profiles.coach_id` must equal that coach (`requireCoachAthleteCalendarAccess` in `lib/authHelpers.ts`). This is **stricter** than subscription-only access for this route (facilities mutations still use `requireAthleteFacilityMutationAccess`, which also allows an active / scheduled-cancellation **subscription**). Below the calendar, a tab bar **Objectifs | Installations | Notes** (`goals.calendarTabObjectives`, `facilities.calendarTabFacilities`, `coachAthleteNotes.calendarTabNotes`). The **Installations** tab lists the athlete’s saved facilities with the same card UI as Mon profil (`AthleteFacilityDetails` / `AthleteFacilityCard` via shared component). The coach can **edit** and **delete** each facility (same modal as the athlete: `AthleteFacilityModal`; server actions `updateAthleteFacility` / `deleteAthleteFacility` with `requireAthleteFacilityMutationAccess` in `lib/authHelpers.ts`). **Creating** a new facility remains **athlete-only** (Mon profil — `createAthleteFacility`). After facility mutations, `revalidatePath` may target `/dashboard/profile`, `/dashboard/athletes/{athleteId}` and `/dashboard/athletes` where applicable. **Notes** tab: private notes authored by the logged-in coach (`coach_athlete_notes`; UI `CoachAthleteNotesSection` + `CoachAthleteNoteModal`; server actions `createCoachAthleteNote`, `updateCoachAthleteNote`, `deleteCoachAthleteNote` in `coachNotesActions.ts` — **same** `requireCoachAthleteCalendarAccess` as the page). The athlete **cannot** read notes (no RLS policy for athletes). **RLS (migration 062):** coach `SELECT` / `INSERT` / `UPDATE` / `DELETE` on rows where `coach_id = auth.uid()` and the athlete is in coach scope (subscription `active` / `cancellation_scheduled` **or** `profiles.coach_id` = coach). After note mutations, `revalidatePath` on `/dashboard/athletes/{athleteId}` only.

---

### 4.2.3 Athlete Statistics (`/dashboard/stats`) ✅

- **Role:** athlete only; non-athletes are redirected from the route.
- **Navigation:** primary item between **Calendar** and **Goals** (`getAthletePrimaryNavItems` in `lib/dashboardNavConfig.ts`); label and metadata i18n `navigation.stats`, `metadata.statsTitle`. Top bar / drawer icon: `components/DashboardNavIcons.tsx` (`/dashboard/stats`).
- **Data:** server uses `getEffectiveWeeklyTotalsFait(athleteId, startDate, endDate)` (same « fait » pipeline as calendar: Strava imports + completed workouts minus same-day same-type double-count). Client refetch via `loadAthleteVolumeChartData` (`app/[locale]/dashboard/stats/actions.ts`). Series built in `lib/athleteStatsVolume.ts` (`buildWeeklyVolumeSeries` / `buildMonthlyVolumeSeries`, `normalizeYears`, `ATHLETE_STATS_SPORT_OPTIONS`). Default sport from profile: `defaultSportFromProfile(practiced_sports)`.
- **UI:** `AthleteStatsPageClient` — filters (years checkboxes max 3, sport `Dropdown`, granularity and metric `Segments`), loading skeleton `AthleteStatsChartFullSkeleton` on refetch (serialized request generation + `setError(null)` at refresh start). Chart: `AthleteStatsVolumeChart` (Nivo `ResponsiveLine`), no Nivo bottom legend; permanent panel **Annual volume** (sum per selected year); Y-axis legend strings `athleteStats.chart.yAxisLegend*` (e.g. Time (h), Distance (km/m)); slice hover tooltip `athleteStats.sliceDetail.weekTooltip`. Chart theme: `lib/athleteStatsNivoTheme.ts` + CSS variables `--chart-*` in `app/globals.css`. Skeletons: `components/athlete/AthleteStatsChartSkeleton.tsx`.
- **Sport labels (global):** `SPORT_TRANSLATION_KEYS` in `lib/sportStyles.ts` maps `nordic_ski` → `sports.ski_fond`, `backcountry_ski` → `sports.ski_randonnee`, `ice_skating` → `sports.patinage_glace` (distinct FR/EN strings in `messages/*/sports`).
- **References:** `docs/DESIGN_SYSTEM.md` (AthleteStatsVolumeChart, skeletons, Nivo theme), `docs/I18N.md` (`athleteStats`, `sports`), archived wireframes `docs/archive/design-athlete-stats/`.

---

### 4.3 Search & Discovery ✅

**Page « Trouver mon coach »** (`/dashboard/find-coach`, athlète sans `profiles.coach_id`) : filtres par **nom ou prénom**, **sport coaché**, **langue** ; grille de tuiles coach (`CoachTile`) avec présentation, offres publiées (max 3 affichées), note moyenne et **nombre d’avis** lorsque `review_count > 0` (sinon badge « Nouveau »). Les **stats agrégées** (moyenne + nombre d’avis) viennent de la RPC **`get_coach_rating_stats`** (SECURITY DEFINER, migration **022**). Un clic sur **« (N avis) »** ouvre une modale **`CoachReviewsModal`** listant les avis (note 1–5, date, commentaire ou libellé sans commentaire) ; les **identités des athlètes noteurs ne sont pas exposées**. Les lignes sont chargées via la RPC **`get_coach_public_reviews(p_coach_id)`** (SECURITY DEFINER, migration **063**), nécessaire car la RLS sur `coach_ratings` ne permet pas aux athlètes de lire les notes des *autres* athlètes. Même liste accessible depuis l’en-tête de la **modale détail coach** (« Voir le détail »). **Clavier :** lorsque la modale liste d’avis est ouverte **au-dessus** de la modale détail, la touche **Échap** ferme d’abord uniquement la liste d’avis (pas toute la modale détail).

Athletes filter coaches by:

- Sport coached
- Language

**Not implemented:**

- Online / in-person filter
- Price range filter

---

### 4.4 Offers ✅

**Structure:**

- Title
- Description
- Price
- Type: `free` | `monthly` | `one_time`
- `display_order`, `is_featured`

**Offer status (lifecycle):**

| Status | Visibility | Meaning |
|--------|------------|---------|
| **draft** | Coach only | Work in progress; price/title/description can be incomplete. Not visible to athletes. Not selectable in a coach request. |
| **published** | Athletes + coach | Live offer. Shown in the coach’s 3 main slots (by `display_order` 0–2) and in discovery. Athletes can choose it when sending a request. At most 3 published offers per coach. |
| **archived** | Coach only | No longer available for new requests. Shown in a separate “Archived offers” list for the coach. Existing subscriptions linked to this offer (via snapshot) are unchanged. |

- A coach can **publish** a draft once the required fields are filled (titres FR/EN, descriptions FR/EN, price, recurrence). **After publication, price and price type are non-editable:** a DB trigger rejects any update to `price`/`price_type` when `status = 'published'`; the coach UI shows the pricing as read-only (compact line + “Non modifiable” badge). A confirmation modal before publishing states that the price will not be editable and that only typos in title/description can be fixed afterwards. When saving the form, the server omits `price` and `price_type` from the update payload for published offers.
- A coach **archives** an offer instead of deleting it (no delete policy); new athletes cannot select it, but current subscriptions keep their frozen snapshot.

**Flow:**

- When the athlete opens the coach detail modal (« Voir le détail »), the request form includes **Sports pratiqués**, **Volumes hebdomadaires** (Volume actuel + Volume maximum in two columns, then volumes par sport; same logic as Mon profil: triathlon → 3 tiles, **trail → no separate tile**, only **D+ in the Course tile**), **Objectifs de course / résultats passés** (optional section), and **Besoin de coaching**. Volumes and coaching need are mandatory; the section goals are optional. The app checks whether the athlete’s profile has **first name and last name**; if either is missing, **Prénom** and **Nom** are also shown (required). The « Envoyer la demande » button stays disabled until offer, sports, both volume fields and per-sport volumes, coaching need and (when shown) first name and last name are filled. On submit, the profile is updated (name if needed, **weekly_current_hours**, **weekly_target_hours**, **weekly_volume_by_sport**, practiced_sports), then the request is created. The coach always sees the athlete’s name on pending requests (from `profiles`).
- **Objectifs de course / résultats passés (demande) :** Between « Volumes hebdomadaires » and « Besoin de coaching », the athlete sees a section listing their **goals** (read-only, sorted by date descending, max 5). They can **add** goals via « Ajouter » (RequestGoalAddModal: same fields as page Objectifs, including optional target time and result if date is past; uses `addGoal`). Each goal has a **single action button** (same logic as page Objectifs) : « Modifier » or « Ajouter un résultat », opening **GoalFullModal** (tabs Objectif | Résultat, one save for both). Tuiles objectifs dans le formulaire : même style que page Mes objectifs (fond blanc pour tuiles volume, pas d’opacité sur objectifs passés, bouton muted). If there are more than 5 goals, « Voir plus (n) » opens RequestGoalsListModal (full list, read-only). **No snapshot** in `coach_requests` — the coach sees the athlete’s **current** goals (from `goals` table; RLS migration 057 allows coach to SELECT goals of athletes with a pending request to them). Pending request tile: two blocks **Objectifs** (upcoming) and **Résultats** (past), same tile style as page Objectifs, max 5 per block, « Voir plus » per block. Athlete « Demande envoyée » modal: goals in read-only, same layout.
- Athlete sends a **coach request** (sport practiced, coaching need, optional offer_id; first/last name if needed; **weekly_current_hours**, **weekly_target_hours** and **weekly_volume_by_sport** saved to profile).
- While the request is **pending**, the coach tile shows « Annuler la demande » (danger) and « Demande envoyée > » (muted). Clicking « Demande envoyée > » opens a modal with the request detail (frozen offer, sports, message, date); the athlete can cancel the request from the tile or from the modal (same confirmation flow).
- If the request fails (server error or DB insert rejected), the user sees a generic error message and the submit button is no longer stuck on « Envoi en cours »; errors are logged server-side for diagnosis.
- When an offer is chosen, the server immediately stores a **snapshot** of that offer in `coach_requests`: `offer_id`, `frozen_price`, `frozen_title`, `frozen_description`. This is the version of the offer **as seen by the athlete** at request time. If the coach later changes or archives the offer, the request row does not change.
- Coach accepts or declines the request. On the « Mes athlètes » page, the athlete list has a **search** field (by name) and a **sort** dropdown: **by name (A–Z)** or **by planned date** (athletes with no planned workout first, then by date ascending — furthest last). The search uses the **SearchInput** component (green clear button); the sort uses the **Dropdown** component (trigger + panel, same styling as top bar nav for selected option). **Pending requests** are shown in a unified tile per request: header with avatar, **name · offer** (offer in smaller font), sport badges, then actions **« Discuter »**, **« Refuser »**, **« Accepter »**. The tile body has **two columns**: **Message de l’athlète** (coaching_need) and **Volumes hebdomadaires** (from the athlete’s **current profile**: Volume actuel, Volume maximum, then volumes by sport; “Sport : value unit” lines with sport-colored left border and icon; D+ in the same block as Course; if empty: « Non renseigné »). Actions: **« Discuter »** (opens the chat overlay targeting that athlete), **« Refuser »** and **« Accepter »** (each opens a confirmation modal before calling the API). On mobile, the three buttons are at the bottom of the tile (Discuss full width, Decline and Accept side by side).
- **Mes athlètes — bandeaux (coach) :** If the coach has **no** offer with status `published` (drafts only, archived only, or none), a **banner** prompts them to manage or publish offers (CTA to `/dashboard/profile/offers`). If the **coach profile is incomplete**, the **complete profile** banner is shown **above** the offer banner. **Vertical order:** profile banner → offer banner (when applicable) → **Pending requests** (if any) → athlete list or empty state. If loading the **athlete list** fails, an **error message** is shown instead of the misleading empty state (i18n `athletes.listLoadError`).
- **On accept:** (1) `profiles.coach_id` is set (athlete linked to coach), (2) `coach_requests.status` → `accepted`, (3) a row is inserted into **`subscriptions`** with the same `frozen_*` data copied from `coach_requests` (the subscription is **not** filled from the current `coach_offers` table). Thus the active subscription between athlete and coach reflects the exact offer the athlete requested; if the coach changes the offer afterwards, existing subscriptions are unchanged.
- No Stripe/payment yet — subscription model is structural only (billing history ready via `subscriptions.frozen_*`).

---

### 4.5 Workouts (Training Programs) ✅

**Current structure (flat, not hierarchical):**

- **Workout** = one session per date
  - `athlete_id`, `date`, `sport_type`, `title`, `description`
  - **Status:** `status` = `planned` | `completed` | `not_completed` (planifié / réalisé / non réalisé). Default at creation: `planned`. Only the athlete can change status (with comment) via `saveWorkoutStatusAndComment`.
  - **Moment de la journée (optionnel):** `time_of_day` = `null` | `'morning'` | `'noon'` | `'evening'` (Non précisé / Matin / Midi / Soir). Coach can set it in create/edit modal via a segment control; used to structure the calendar day view by sections.
  - Targets: `target_duration_minutes`, `target_distance_km`, `target_elevation_m`, `target_pace`
  - Athlete: `athlete_comment`, `athlete_comment_at`
  - **Retour athlète (optionnel):** `perceived_feeling` (1–5), `perceived_intensity` (1–10), `perceived_pleasure` (1–5). Only the athlete can set these; coach sees them read-only. Saved with status and comment via `saveWorkoutStatusAndComment`. Migration 054.

**Sport types:** course, musculation, natation, velo, nordic_ski, backcountry_ski, ice_skating

**Athlete can:**

- View workouts in calendar (tiles show status badge: Planifié / Réalisé / Non réalisé)
- Open session modal: header = sport pill (icon + label) + session title (can wrap on small screen); body = date only, then objectives + description, then status selector (3 segments); when status = **Réalisé (completed)**, three optional feedback questions appear: **Comment vous êtes-vous senti ?** (scale 1–5 with Lucide icons + labels), **Intensité de l'effort ressenti :** (scale 1–10 segments), **Plaisir pris pendant la séance :** (scale 1–5 with Lucide icons + labels); then comment; save status + feedback + comment in one action
- See imported Strava activities alongside planned workouts

**Coach can:**

- Create / update / delete workouts for their athletes
- **Create & edit modal:** header aligned for both flows: date picker on the left (month in full letters), status badge (Planifié / Réalisé / Non réalisé) on the right; no title nor check icon. The date opens a **DatePickerPopup** (design system) as a **popover** under the field (not a second modal); month list from current month to current month + 2 years (see `docs/DESIGN_SYSTEM.md` § DatePickerPopup). Body: Sport (SportTileSelectable), title, **Moment de la journée** (segment control: Non précisé | Matin | Midi | Soir, optional), session objectives (toggle time/distance, grid, description in same block), athlete comment read-only; footer: Delete, Save. Editable only when session date is in the future and status ≠ completed.
- **Read-only modal:** when session is in the past or status = completed: header = sport pill (design B, icon + label) + session title (can wrap on small screen), status badge on the right; body = date only (sport in header), with moment appended if set (e.g. « lundi 3 mars · Matin »), then objectives, description; if the athlete has filled feedback (feeling, intensity, pleasure), section **Retour athlète** with the three values (icons + labels for 1–5 scales, X/10 for intensity); then athlete comment; no form nor buttons.
- **Coach workout modal — athlete facility hours (read-only):** Below the date in the header (create, edit, or read-only), the coach sees **opening hours** for the athlete’s **saved facilities** (`athlete_facilities`) matching the **workout sport** for the **local calendar day** of the workout date (swimming → pool, strength → gym, running → stadium; **cycling → no strip**). Facilities are sorted **alphabetically by name**; each line shows a **building icon** (same for all), **name**, time slots or **closed** for that day. Implementation: `WorkoutFacilityHoursStrip`, `lib/workoutFacilityHours.ts`; i18n: `workouts.facilityHoursStripAriaLabel`, `facilities.hours.closed`. Coach **SELECT** on `athlete_facilities` uses the same access pattern as workouts (active / `cancellation_scheduled` subscription with the athlete, or **`profiles.coach_id`** linking the athlete to the coach; RLS migrations 059–060). See `docs/DESIGN_SYSTEM.md` (WorkoutFacilityHoursStrip).
- On the calendar (workout tile and day modal), see status and when an athlete has left a comment (comment icon in the metadata row)
- See weekly totals per sport and planning status (“Planifié jusqu’au”, “En retard”)

**Total « fait » (US6):** Weekly totals « fait » = imported Strava activities + sessions with `status = 'completed'`, **minus** the volume of completed sessions that have an imported activity **same day and same sport type** (no double-counting). Mapping: `lib/stravaMapping.ts`. Server: `getEffectiveWeeklyTotalsFait(athleteId, startDate, endDate)` used by calendar and athlete pages.

**Unités d’affichage (calendrier et totaux hebdomadaires) :** Pour la **natation**, les distances sont affichées en **mètres (m)** et arrondies au mètre près (pas en km). Pour les autres sports à distance (course, vélo, ski, patin), l’unité reste le **km**.

**Calendar (responsive):** On viewports **&lt; 768px** (`md`), athlete and coach calendar pages keep the **week-first** layout: two-line header (title then **WeekSelector**), the **weekly totals** block (total planned time + per-sport bars), then **one week** with days stacked vertically—unchanged (`docs/archive/calendar-mobile-44/`, `docs/archive/calendar-mobile-weekly-total/`). From **768px up**, the layout is an **extended civil-month grid** with **full ISO weeks** (Mon–Sun): from the Monday of the week that contains the month’s first day through the Sunday of the week that contains the month’s last day; days outside the selected month are **muted**. Navigation uses **MonthSelector** (prev | month + year | next) instead of the week carousel. Each visible ISO week has a **weekly totals card**; the day grid shows every week of the extended month (typically **4–6 weeks**). **Data** for workouts, Strava imports, availability, and weekly totals is loaded for that extended range (`getExtendedCalendarMonthGridBounds` in `lib/dateUtils.ts`, `fetchCalendarDataBundle` in `app/[locale]/dashboard/workouts/actions.ts`) on SSR and on client when the month changes. **Goals** shown in the calendar area are **not** filtered by that date range. See **`docs/CALENDAR_MONTH_VIEW.md`** and archived mockups **`docs/archive/design-calendar-month-view/`**.

**Calendar day structure (moment de la journée):** For each day, content is ordered by **sections**. (1) **First block (no section title):** goals, workouts with no time_of_day, imported Strava activities. (2) **Morning / Noon / Evening sections:** workouts with `time_of_day` = morning, noon, or evening are grouped under a section title (Matin / Midi / Soir); empty sections are not shown. The same ordering applies in the « Activités du jour » modal. Tile colors and icons remain sport-based only (see design system).

**Athlete availability (disponibilités / indisponibilités):** The athlete can declare **availability** or **unavailability** slots per day so the coach can plan workouts accordingly. **Not implemented: recurrence** — each slot is for a single date only. (1) **Athlete:** On **future** calendar days, a « + » button opens a modal to **create** a slot: type (Disponible / Indisponible via Segments), date (header, DatePickerPopup), optional start/end time (15‑min steps), optional note. Multiple slots per day are allowed. Clicking a slot opens the **edit** modal (same form, Delete + Save). (2) **Coach:** On an athlete’s calendar, availability tiles are **read-only**; clicking a tile opens a detail modal (date, type, time range or “Journée entière”, note) with a single Close button. (3) **Order in day column:** availability slots → goals → workouts → Strava. (4) **Tile style:** thin border (green for available, orange for unavailable), calendar icon, label + optional time range or note; see `docs/DESIGN_SYSTEM.md`. Data: table `athlete_availability_slots` (§5); RLS: athlete full CRUD on own rows, coach SELECT only for their athletes.

**Week selector (WeekSelector):** On **calendar pages below `md`**, the selected week is displayed in the center—one line from `lg` (1024px), two lines below `lg`—with fixed widths so the bar length does not change when changing weeks. The previous/next week dates in the left and right buttons are visible from 400px viewport width and hidden below 400px so the selector fits on narrow screens; button widths are fixed (40px below 400px, 80px from 400px). From **`md` up**, the calendar header uses **MonthSelector** instead (see **MonthSelector** in `docs/DESIGN_SYSTEM.md`). Design mockups archived in `docs/archive/design-week-selector-two-lines/`.

**Not implemented:**

- Program → Weeks → Days → Sessions → Exercises hierarchy
- Exercises with sets, reps, load, media

---

### 4.6 Messaging ✅

- 1-to-1 chat: Athlete ↔ Coach
- One conversation per coach–athlete pair
- Simple text messages (no attachments, no rich formatting in MVP)
- Chat access is request-driven: conversation can be started when a `coach_request` is `pending`, and remains available in read-only when sending is no longer allowed.
- **Latest writable request:** When there is a **new** pending request or a **new** active (or cancellation_scheduled) subscription after a previous decline or ended subscription, the coach and athlete can write again. The app updates the conversation’s `request_id` to the latest writable request for the pair (listing and sendMessage both ensure this); RLS allows participants to update `conversations.request_id` (policy `conversations_update_participant`, migration 048).
- Conversation write access rules:
  - `pending` request: coach and athlete can read/write.
  - `accepted` request: read/write only while linked subscription is `active` or `cancellation_scheduled`.
  - `declined`, cancelled/deleted request, or accepted request with cancelled subscription: conversation remains readable, sending is blocked (read-only) **until** a new writable request exists for the pair.
- Coach can start a conversation from the chat overlay by opening the athlete list and selecting an athlete (conversation is created if needed).
- Athlete can also start/select a conversation from the same overlay pattern (list + sidebar + panel) when multiple coach requests exist.
- Overlay states (coach and athlete):
  - state 1: no open conversation → contact list
  - state 2a/2b: open conversations in sidebar + conversation panel
  - state 3: "Ouvrir une discussion" view (contact list + search)
- Mobile (`< md`): list/conversation navigation with back button. Desktop (`>= md`): sidebar + panel.
- Closing a conversation removes it from the local "open conversations" list in overlay (persisted while navigating inside dashboard pages).

---

### 4.7 Goals ✅

- Athlete defines race/event (date, race_name, distance, is_primary). **Création avec date passée autorisée** : l'athlète peut ajouter un objectif rétrospectif puis saisir le résultat.
- **Objectif de temps (facultatif) :** À la création et à l’édition, l’athlète peut renseigner un **objectif de temps** (3 champs h/min/s ; champs vides = 0, ex. « 1h 30min 30s » ; 55 min seul → affichage « 55min »). Données : `goals.target_time_hours/minutes/seconds` (migration 056). Affichage sur les tuiles : « Objectif : 3h 30min » ou « 55min » si une seule composante ; pour un objectif **passé** avec résultat : « Objectif 3h 30min · Réalisé 3h 45min » (et place si présente). Modale détail objectif (calendrier) : ligne « Objectif de temps » si présent. Visible par l’athlète et le coach (lecture seule pour le coach).
- **Modification objectif + résultat (modale fusionnée) :** Un **seul bouton** par tuile ouvre la modale **GoalFullModal** (onglets Objectif | Résultat). Libellé du bouton : **« Modifier »** si date > aujourd’hui ou si date ≤ aujourd’hui avec résultat déjà saisi ; **« Ajouter un résultat »** si date ≤ aujourd’hui sans résultat. Enregistrement en une fois (objectif + résultat si date passée) via l’action **`saveGoalFull`**. Si date > aujourd’hui : seul l’onglet Objectif est affiché ; si date ≤ aujourd’hui : deux onglets, ouverture par défaut sur l’onglet Résultat. Objectif de temps : même formulaire que l’édition (nom, date, distance, priorité, objectif de temps). **Résultat (date passée) :** temps en **h/min/s** — **aucun des trois champs n’est obligatoire** ; si au moins un champ temps est saisi, les champs vides sont enregistrés comme **0** ; si **tous** les champs temps sont vides à l’enregistrement, le résultat est **effacé** (temps + place + note, colonnes `result_*` à `null`). Place et note : optionnelles lorsqu’un temps est saisi ; note max 500 car. Même logique côté **`saveGoalResult`** (modale résultat seule) et **`addGoal`** pour un objectif créé avec date passée (résultat optionnel dans le formulaire). Données : `goals.result_time_hours/minutes/seconds`, `result_place`, `result_note` (migration 053).
- **Affichage :** Sur la tuile objectif (page Objectifs, sidebar calendrier coach, modale détail calendrier) : **bloc date** (mois + année sur une ligne, ex. « Mar. 26 », jour en dessous) à gauche ; distance ; si objectif de temps : « Objectif : X » ou « Objectif X · Réalisé Y » (passé avec résultat) ; si résultat sans objectif de temps : « distance · temps · place ». Si passé sans résultat : « Aucun résultat saisi » sur la même ligne que la distance. Bouton d’action unique (Modifier / Ajouter un résultat), style **muted** ; Supprimer à part. **Saisons** sur la page Objectifs : triées de la plus loin dans le futur en haut. **Pas d’opacité** sur les tuiles passées (même rendu cliquable que les futures). Format du bloc date : `formatGoalDateBlock` dans `lib/dateUtils.ts` (retourne `monthYear`, `day`).
- **Différenciation visuelle objectif / résultat :** Dès que la **date de l’événement ≤ date du jour** (jour J inclus), la tuile est affichée en **style résultat** : bande gauche **grise** uniquement (pas de contour), au lieu de la bande colorée (ambre = principal, sage = secondaire). Condition d’affichage : `goal.date <= today` (pas seulement « résultat saisi »). **Badges** Principal / Secondaire et **badges sport** : fond **blanc**, texte et contour colorés (amber / sage / couleur sport). Sélecteur priorité dans les formulaires d’ajout/édition : option sélectionnée avec fond blanc, arrondi **rounded-lg** (aligné champs de saisie). Référence : comportement et UI détaillés dans **docs/DESIGN_SYSTEM.md** (§ Badge, § TileCard) ; design archivé dans `docs/archive/design-objectif-vs-resultat/`.
- **Utilitaires :** `lib/goalResultUtils.ts` (hasGoalResult, formatGoalResultTime, formatGoalResultPlaceOrdinal, **hasTargetTime**, **formatTargetTime** ; affichage des unités h/min/s même pour une seule composante, ex. « 55min »). Actions : `addGoal` (objectif de temps optionnel, champs vides = 0 ; résultat passé optionnel, voir ci‑dessus), **`saveGoalFull`** (modale fusionnée : objectif + résultat en une sauvegarde), `updateGoal` et **`saveGoalResult`** (modale résultat / usages ciblés). **i18n (validation) :** `goals.validation.missingGoalId` si `goal_id` absent lors de l’enregistrement du résultat ; la clé historique `timeRequired` a été retirée des messages (comportement résultat assoupli).
- Coach has read-only access to athlete goals (including target time and result when present).
- Displayed as “Prochain objectif” on coach dashboard.

---

### 4.8 Coach Ratings & Reviews ✅

- Athlete rates coach (1–5) with optional comment
- One rating per athlete–coach pair (can be updated)
- Aggregated stats (average, count) visible on coach profile for discovery

---

### 4.9 Strava Integration ✅

- Athlete connects Strava (OAuth)
- Activities imported into calendar
- Weekly totals per sport (imported activities)
- Separate “Mes appareils connectés” (devices) section

---

### 4.10 Subscription view, end, and cancellation scheduled ✅

**Athlete (Mon Coach):**

- Bloc « Ma souscription » shows frozen offer (title, description, price/type, dates).
- Button « Mettre fin » opens confirmation modal. For **monthly** subscriptions, ending schedules the subscription end at next cycle → status becomes « En résiliation » (amber badge), line « Fin prévue le {date} » (same line as « A débuté le »).
- Button « Annuler la résiliation » is shown **only to the person who requested the cancellation** (stored in `cancellation_requested_by_user_id`). The other party sees nothing in that slot.
- Top bar / drawer: « Historique des souscriptions » → `/dashboard/subscriptions/history` (past subscriptions, read-only).

**Coach:**

- Mes athlètes: click on subscription line opens detail modal (same content as « Ma souscription » + athlete name). Badge Active or « En résiliation »; button « Mettre fin » or « Annuler la résiliation » (latter only for the requester; otherwise optional hint « Seule la personne ayant demandé… »).
- Page Souscriptions (`/dashboard/subscriptions`): **three sections** — (1) **Souscriptions actives** (green left border), (2) **En résiliation** (amber left border), (3) **Historique** (grey). Same rule: only the requester can use « Annuler la résiliation ».

**Rules:**

- **Immediate end (free / one_time):** `subscriptions.status = 'cancelled'`, `end_date = now`, `profiles.coach_id = null` for the athlete.
- **Monthly:** On « Mettre fin », set `status = 'cancellation_scheduled'`, `end_date` = next cycle, `cancellation_requested_by_user_id` = current user. At `end_date`, a daily cron sets `status = 'cancelled'` and `profiles.coach_id = null`.
- **Cancel cancellation:** Allowed only when `auth.uid() === cancellation_requested_by_user_id`; then `status = 'active'`, `end_date = null`, `cancellation_requested_by_user_id = null`.

---

### 4.11 Public contact form ✅

**Besoin produit :** permettre à tout visiteur (et aux utilisateurs connectés) d’**écrire au support** sans passer par le chat coach : saisie des coordonnées, **motif** (liste définie), **message**, téléphone optionnel ; accusé avec **référence unique** `MSA-YYYY-NNNNNN`.

**Routes :** `/contact` et `/en/contact` (`app/[locale]/contact/page.tsx`). **Entrées UI :** lien « Contact » / « Contactez-nous » depuis le **footer** de la landing, les **menus compte** athlète et coach (`DashboardTopBar`), et le **drawer** mobile (voir `docs/DESIGN_SYSTEM.md`, `lib/dashboardNavConfig.ts`).

**Comportement :** formulaire client `components/ContactForm.tsx` (`useActionState`, honeypot `website`, locale cachée `_locale`) ; préremplissage nom / prénom / e-mail si session + profil (`getOptionalUserWithProfile`). **Validation** alignée client/serveur : plafonds partagés dans `lib/contactFormConstraints.ts` (prénom/nom 100 car., message 10 000, e-mail 320, téléphone tronqué côté serveur) ; messages d’erreur distincts **vide** vs **trop long** (`contact.errors.*`). Envoi désactivé tant que le formulaire n’est pas valide.

**Persistance :** tables `contact_submission_counters` (séquence par année civile UTC) et `contact_submissions` ; insertion uniquement via RPC **`insert_contact_submission`** (migrations **066** puis **067** — `RETURN QUERY` explicite, normalisation téléphone). RLS activée **sans policy** : pas d’accès direct anonyme ; l’app utilise **`createAdminClient()`** (`SUPABASE_SECRET_KEY` ou `SUPABASE_SERVICE_ROLE_KEY`).

**E-mail :** envoi via **API Resend** depuis le serveur (`lib/contactSupportEmail.ts`), **pas** via les templates Supabase Auth : variable **`RESEND_API_KEY`** (alias toléré `RESEND_KEY`) ; `CONTACT_EMAIL_FROM` / `CONTACT_SUPPORT_TO` optionnels ; **Reply-To** = e-mail du formulaire. En cas d’échec d’envoi après insert, message dédié (`emailSendFailed` / `emailNotifyUnavailable` si clé absente). Champ `email_delivered_at` mis à jour après envoi réussi.

**Références design :** maquettes archivées `docs/archive/design-contact-public-form/` (anciennement `docs/design/contact/`).

---

## 5. Data Model (Current)

**Main entities:**

| Entity | Purpose |
|--------|---------|
| `profiles` | User profile, role, coach_id, coached_sports, languages, presentation, avatar, postal_code. **Athlete:** `practiced_sports`, `weekly_current_hours` (h, “Volume actuel”), `weekly_target_hours` (h, “Volume maximum”), `weekly_volume_by_sport` (JSONB: sport → volume; keys e.g. course, velo, natation, musculation, `course_elevation_m` for trail D+). |
| `athlete_facilities` | Facilities used by athlete (`athlete_id`, `facility_type`, `facility_name`, `address`, `address_postal_code`, `address_city`, `address_country`, `address_complement`, `opening_hours` JSONB). **Athlete:** full CRUD on own rows. **Coach:** `SELECT` / `UPDATE` / `DELETE` when linked via `active` or `cancellation_scheduled` subscription **or** `profiles.coach_id` (same scope as workouts; migrations 059–060 for read, **061** for coach update/delete). **Admin:** read-all. **Insert** remains athlete-only (`athlete_id = auth.uid()`). |
| `coach_athlete_notes` | Private notes by coach on an athlete (`athlete_id`, `coach_id`, `title`, `body`, `created_at`, `updated_at`). **Athlete:** no policy (no access). **Coach:** full CRUD on own rows (`coach_id = auth.uid()`), athlete in scope (subscription `active` / `cancellation_scheduled` **or** `profiles.coach_id` = coach). **App** route uses `requireCoachAthleteCalendarAccess` (assigned coach only). Migration **062**. |
| `coach_offers` | Coach offers (title, description, price, price_type). Status: `draft` (coach only) / `published` (3 slots, visible to athletes) / `archived` (coach only, no new requests). |
| `coach_requests` | Athlete → Coach request (status: pending / accepted / declined). When offer is chosen: `offer_id` + snapshot `frozen_price`, `frozen_title`, `frozen_description` (offer as seen by athlete at request time). |
| `subscriptions` | Subscription per accepted request: `athlete_id`, `coach_id`, `request_id`, same `frozen_*` copied from `coach_requests` (not from offers). `status`: `'active'` \| `'cancellation_scheduled'` \| `'cancelled'`. `cancellation_requested_by_user_id` (UUID, nullable): user who requested the scheduled cancellation; only they can cancel the cancellation. Used for billing history; unchanged if coach later changes the offer. |
| `workouts` | Planned training sessions for an athlete. `status`: `planned` \| `completed` \| `not_completed` (default `planned`; only athlete can update). `time_of_day`: optional `null` \| `'morning'` \| `'noon'` \| `'evening'` for calendar day sections. Optional athlete feedback: `perceived_feeling` (1–5), `perceived_intensity` (1–10), `perceived_pleasure` (1–5); migration 054. |
| `athlete_availability_slots` | Athlete availability/unavailability per date. One row per slot: `athlete_id`, `date`, `type` (`available` \| `unavailable`), optional `start_time` / `end_time`, `note`. No recurrence; athlete CRUD on own rows, coach read-only for their athletes. |
| `goals` | Athlete race/event objectives. Optional **target time** (migration 056): `target_time_hours/minutes/seconds`. Optional result for past goals (migration 053): `result_time_hours/minutes/seconds`, `result_place`, `result_note`. |
| `conversations` | 1-to-1 coach–athlete. Includes `request_id` (source `coach_requests` row) used to determine chat write access lifecycle. Participants can update `request_id` to the latest writable request (RLS policy `conversations_update_participant`). |
| `chat_messages` | Messages in a conversation |
| `coach_ratings` | Athlete rating + comment for coach (1–5, comment optional; **unique** `(athlete_id, coach_id)`). **RLS :** athlète lit/écrit **sa** ligne ; coach lit **ses** notes reçues. **Affichage public (autres athlètes) :** pas de SELECT direct ; agrégats via RPC **`get_coach_rating_stats`** ; liste des avis via RPC **`get_coach_public_reviews`** (migration **063**, sans colonne `athlete_id` dans le résultat). |
| `contact_submission_counters` | Compteur annuel pour références formulaire contact (`year` PK, `last_seq`). Utilisé par la RPC **`insert_contact_submission`** uniquement. Migration **066**. |
| `contact_submissions` | Messages du formulaire contact public : `reference` unique (`MSA-YYYY-NNNNNN`), `locale` (`fr` \| `en`), identité, e-mail, téléphone optionnel, `reason_key`, `message`, `user_id` optionnel (`auth.users`), `email_delivered_at`. **RLS** activée, aucune policy : écriture via RPC **`insert_contact_submission`** (**SECURITY DEFINER**, **GRANT EXECUTE** à `service_role` uniquement). Migrations **066**–**067**. |
| `athlete_connected_services` | Strava OAuth tokens |
| `imported_activities` | Activities from Strava |
| `workout_weekly_totals` | Precomputed weekly totals (planned) |
| `imported_activity_weekly_totals` | Weekly totals (imported) |

---

## 6. Technical Guidelines

- **Stack:** Next.js (App Router), Supabase (Auth, DB, RLS), **next-intl (i18n FR/EN)**
- **Folder structure:**
  - `/app/[locale]` — localised routes (dashboard, admin, login, etc.)
  - `/app/api`, `/app/auth` — API and auth callbacks (not localised)
  - `/components` — shared components
  - `/messages` — fr.json, en.json (translations)
  - `/utils` — auth, Supabase clients
- **i18n:** Application is bilingual (French default, English). **Every new feature must be translated from day one** — use next-intl, no hardcoded user-facing strings. See `docs/I18N.md`.
- **Auth:** Supabase Auth, server-side `getCurrentUserWithProfile()`, `requireRole()`
- **Security:** RLS on all tables, role-based policies
- **Stripe:** Not implemented yet; schema is payment-ready

**Avoid:**

- Overusing global state
- Complex microservices
- Unnecessary design patterns

---

## 7. UX Principles

- Minimal UI
- Clean layout
- **Couleurs :** utiliser en priorité les tokens du design system (`tailwind.config.ts`) : `palette-forest-dark`, `palette-forest-darker`, `palette-olive`, `palette-sage`, `palette-gold`, `palette-amber`, `palette-strava`. Ne pas introduire de couleurs en dur (hex).
- Clear hierarchy
- Dashboard-centric navigation
- Mobile-friendly sidebar
- **Bilingual:** French (default) and English — all UI and messages via next-intl; new features must include translations (see `docs/I18N.md`).

---

## 8. Design System

**Documentation complète :** `docs/DESIGN_SYSTEM.md`

Le design system garantit la cohérence visuelle et la maintenabilité du code. Toujours privilégier les composants et tokens existants.

### Composants disponibles

- **Button** : 8 variantes (primary, primaryDark, secondary, outline, muted, ghost, danger, strava)
- **Input / Textarea** : Champs de formulaire avec états unified (disabled, readOnly, error)
- **Badge** : Étiquettes pour sports (avec icônes SVG), langues, statuts
- **SportTileSelectable** : Tuiles cliquables/sélectionnables (profil, filtres)

### Tokens clés

- **Couleurs** : `palette-forest-dark`, `palette-olive`, `palette-sage`, `palette-gold`, `palette-amber`, `palette-danger`, `palette-strava`
- **Sports** : Icônes SVG centralisées dans `lib/sportStyles.ts`
- **Rayons** : `rounded-full` (badges), `rounded-2xl` (cartes), `rounded-xl` (inputs), `rounded-lg` (boutons)
- **Ombres** : `shadow-sm` (cartes), `shadow-lg` (hover), `shadow-xl` (modales)

### Guidelines

1. **Utiliser les composants** plutôt que des styles inline
2. **Utiliser les tokens** plutôt que des valeurs en dur
3. **États disabled/readOnly** : fond gris (`bg-stone-100`), texte gris (`text-stone-500`)
4. **Hiérarchie typographique** : `text-2xl font-bold` (H1), `text-lg font-bold` (H2), `text-sm` (body)

### Page Design System

Accessible aux admins : `/dashboard/admin/design-system`

Affiche tous les composants, variantes, et exemples d'utilisation.

---

## 9. Business Model

**Primary:**

- Commission on transactions (not implemented)

**Future:**

- Subscription for professionals
- Premium features
- Advanced analytics

---

## 9. Future Roadmap (Do NOT build unless requested)

- Garmin integration
- AI-generated programs
- Mobile app
- Smart matching algorithm
- Physiotherapist, nutritionist roles
- Program → Weeks → Days → Sessions → Exercises structure
- Stripe payments

---

## 10. Instructions for AI Assistants (Cursor)

When generating code:

- **Couleurs :** privilégier les tokens de la palette (`palette-forest-dark`, `palette-olive`, etc.) — pas de valeurs hex en dur.
- **i18n :** toujours penser bilingue — pas de texte utilisateur en dur ; utiliser next-intl et `docs/I18N.md`.
- Prioritize simplicity
- Deliver MVP solutions first
- Avoid unnecessary abstraction
- Keep components reusable
- Keep database normalized
- Ensure role-based access control (RLS)
- Write clean and maintainable code
- Follow existing patterns (e.g. server actions, Supabase client)

**Never:**

- Add complex enterprise patterns
- Over-design the system
- Add features not explicitly requested
- Break role separation
- Introduce new global state unless necessary
- Add hardcoded user-facing strings (always use next-intl; see `docs/I18N.md`)

The product must remain **simple**, **accessible**, **scalable**, and **bilingual (FR/EN)**.
