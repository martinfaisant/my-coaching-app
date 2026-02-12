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

**Flow:**

- Athlete sends a **coach request** (sport practiced, coaching need, optional offer_id)
- Coach accepts or declines
- On accept: `profiles.coach_id` is set, athlete is linked to coach
- No Stripe/payment yet — subscription model is structural only

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

**Not implemented:**

- Program → Weeks → Days → Sessions → Exercises hierarchy
- Exercises with sets, reps, load, media

---

### 4.6 Messaging ✅

- 1-to-1 chat: Athlete ↔ Coach
- One conversation per coach–athlete pair
- Simple text messages (no attachments, no rich formatting in MVP)

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

## 5. Data Model (Current)

**Main entities:**

| Entity | Purpose |
|--------|---------|
| `profiles` | User profile, role, coach_id, coached_sports, languages, presentation, avatar, postal_code |
| `coach_offers` | Coach offers (title, description, price, price_type) |
| `coach_requests` | Athlete → Coach request (status: pending / accepted / declined) |
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

- **Stack:** Next.js (App Router), Supabase (Auth, DB, RLS)
- **Folder structure:**
  - `/app/dashboard` — main app (role-based views)
  - `/app/admin` — admin-only pages
  - `/components` — shared components
  - `/utils` — auth, Supabase clients
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
- French as primary language (app labels)

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

The product must remain **simple**, **accessible**, and **scalable**.
