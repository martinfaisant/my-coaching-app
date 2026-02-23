# 🧠 PROJECT CONTEXT – Sport & Health Marketplace

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
- Search coaches (filter by sport, language)
- View coach profiles and offers
- Send coaching request (with offer selection)
- Access training calendar (workouts assigned by coach)
- Track workouts (mark complete, add comments)
- Manage goals (races, dates)
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
- Manage athletes (see list, access athlete calendar)
- Create workouts for athletes (date, sport, title, description, targets)
- View athlete goals (read-only)
- View workout weekly totals and planning status
- Chat with athletes
- Receive ratings from athletes

---

### Admin

**Can (current):**

- View all members
- Manage members and roles (athlete, coach, admin) via `/admin/members`

**Future:**

- Moderate users
- Handle disputes
- Manage platform settings

---

## 4. Core Features (Current State)

### 4.1 Authentication ✅

- Email/password (Supabase Auth)
- Role selection at signup (athlete or coach)
- Password reset
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

### 4.3 Search & Discovery ✅

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

- A coach can **publish** a draft once the required fields are filled (titres FR/EN, descriptions FR/EN, price, recurrence). After publication, price and type are locked; only title/description can still be edited.
- A coach **archives** an offer instead of deleting it (no delete policy); new athletes cannot select it, but current subscriptions keep their frozen snapshot.

**Flow:**

- Athlete sends a **coach request** (sport practiced, coaching need, optional offer_id).
- While the request is **pending**, the coach tile shows « Annuler la demande » (danger) and « Demande envoyée > » (muted). Clicking « Demande envoyée > » opens a modal with the request detail (frozen offer, sports, message, date); the athlete can cancel the request from the tile or from the modal (same confirmation flow).
- If the request fails (server error or DB insert rejected), the user sees a generic error message and the submit button is no longer stuck on « Envoi en cours »; errors are logged server-side for diagnosis.
- When an offer is chosen, the server immediately stores a **snapshot** of that offer in `coach_requests`: `offer_id`, `frozen_price`, `frozen_title`, `frozen_description`. This is the version of the offer **as seen by the athlete** at request time. If the coach later changes or archives the offer, the request row does not change.
- Coach accepts or declines the request.
- **On accept:** (1) `profiles.coach_id` is set (athlete linked to coach), (2) `coach_requests.status` → `accepted`, (3) a row is inserted into **`subscriptions`** with the same `frozen_*` data copied from `coach_requests` (the subscription is **not** filled from the current `coach_offers` table). Thus the active subscription between athlete and coach reflects the exact offer the athlete requested; if the coach changes the offer afterwards, existing subscriptions are unchanged.
- No Stripe/payment yet — subscription model is structural only (billing history ready via `subscriptions.frozen_*`).

---

### 4.5 Workouts (Training Programs) ✅

**Current structure (flat, not hierarchical):**

- **Workout** = one session per date
  - `athlete_id`, `date`, `sport_type`, `title`, `description`
  - Targets: `target_duration_minutes`, `target_distance_km`, `target_elevation_m`, `target_pace`
  - Athlete: `athlete_comment`, `athlete_comment_at`

**Sport types:** course, musculation, natation, velo, nordic_ski, backcountry_ski, ice_skating

**Athlete can:**

- View workouts in calendar
- Mark session with comment
- See imported Strava activities alongside planned workouts

**Coach can:**

- Create / update / delete workouts for their athletes
- See weekly totals per sport and planning status (“Planifié jusqu’au”, “En retard”)

**Calendar (responsive):** On viewports &lt; 768px (breakpoint md), the athlete and coach calendar pages show a two-line header (title then week selector) and a single week with days stacked vertically; from 768px, the desktop layout (three weeks, 7-column grid) is used. Spec archived in `docs/archive/calendar-mobile-44/`.

**Not implemented:**

- Program → Weeks → Days → Sessions → Exercises hierarchy
- Exercises with sets, reps, load, media

---

### 4.6 Messaging ✅

- 1-to-1 chat: Athlete ↔ Coach
- One conversation per coach–athlete pair
- Simple text messages (no attachments, no rich formatting in MVP)
- Coach can start a conversation from the chat overlay by opening the athlete list and selecting an athlete (conversation is created if needed)
- Coach overlay states:
  - state 1: no open conversation → athlete list
  - state 2a/2b: open conversations in sidebar + conversation panel
  - state 3: "Ouvrir une discussion" view (athlete list + search)
- Closing a conversation removes it from the coach sidebar (open conversations list is persisted while navigating inside dashboard pages)
- Athlete list includes subscriptions with status `active` and `cancellation_scheduled`
- Mobile chat layout uses the same project breakpoint as calendar: `< md` list/conversation navigation with back button, `>= md` desktop sidebar + panel layout

---

### 4.7 Goals ✅

- Athlete defines race/event (date, race_name, distance, is_primary)
- Coach has read-only access to athlete goals
- Displayed as “Prochain objectif” on coach dashboard

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
- Sidebar: « Historique des souscriptions » → `/dashboard/subscriptions/history` (past subscriptions, read-only).

**Coach:**

- Mes athlètes: click on subscription line opens detail modal (same content as « Ma souscription » + athlete name). Badge Active or « En résiliation »; button « Mettre fin » or « Annuler la résiliation » (latter only for the requester; otherwise optional hint « Seule la personne ayant demandé… »).
- Page Souscriptions (`/dashboard/subscriptions`): **three sections** — (1) **Souscriptions actives** (green left border), (2) **En résiliation** (amber left border), (3) **Historique** (grey). Same rule: only the requester can use « Annuler la résiliation ».

**Rules:**

- **Immediate end (free / one_time):** `subscriptions.status = 'cancelled'`, `end_date = now`, `profiles.coach_id = null` for the athlete.
- **Monthly:** On « Mettre fin », set `status = 'cancellation_scheduled'`, `end_date` = next cycle, `cancellation_requested_by_user_id` = current user. At `end_date`, a daily cron sets `status = 'cancelled'` and `profiles.coach_id = null`.
- **Cancel cancellation:** Allowed only when `auth.uid() === cancellation_requested_by_user_id`; then `status = 'active'`, `end_date = null`, `cancellation_requested_by_user_id = null`.

---

## 5. Data Model (Current)

**Main entities:**

| Entity | Purpose |
|--------|---------|
| `profiles` | User profile, role, coach_id, coached_sports, languages, presentation, avatar, postal_code |
| `coach_offers` | Coach offers (title, description, price, price_type). Status: `draft` (coach only) / `published` (3 slots, visible to athletes) / `archived` (coach only, no new requests). |
| `coach_requests` | Athlete → Coach request (status: pending / accepted / declined). When offer is chosen: `offer_id` + snapshot `frozen_price`, `frozen_title`, `frozen_description` (offer as seen by athlete at request time). |
| `subscriptions` | Subscription per accepted request: `athlete_id`, `coach_id`, `request_id`, same `frozen_*` copied from `coach_requests` (not from offers). `status`: `'active'` \| `'cancellation_scheduled'` \| `'cancelled'`. `cancellation_requested_by_user_id` (UUID, nullable): user who requested the scheduled cancellation; only they can cancel the cancellation. Used for billing history; unchanged if coach later changes the offer. |
| `workouts` | Planned training sessions for an athlete |
| `goals` | Athlete race/event objectives |
| `conversations` | 1-to-1 coach–athlete |
| `chat_messages` | Messages in a conversation |
| `coach_ratings` | Athlete rating + comment for coach |
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
