# 📚 Index de la Documentation

**Dernière mise à jour :** 3 mars 2026 (Mode Analyste : workout feedback — archivage docs design-workout-feedback ; voir Project_context §4.5, DESIGN_SYSTEM § Modal)

> ⚠️ **Avant de créer un nouveau document, TOUJOURS vérifier cet index pour éviter les doublons !**

---

## 🎯 Documentation Active (à utiliser en priorité)

### **README.md** ⭐
- **Contenu :** Setup projet, stack technique, quick start, structure du projet, **URL production https://mysportally.com**
- **Utiliser pour :** Onboarding, démarrage rapide, vue d'ensemble technique
- **Taille :** ~200 lignes
- **Dernière mise à jour :** 24 février 2026

### **Project_context.md** ⭐
- **Contenu :** Vision produit, philosophie, rôles (Athlete/Coach/Admin), features actuelles, data model (dont snapshot offre + souscriptions, vue/résiliation, En résiliation), stack technique, **URL production https://mysportally.com**
- **Utiliser pour :** Comprendre le projet, les features, les rôles, l'architecture globale
- **Taille :** ~420 lignes
- **Dernière mise à jour :** 3 mars 2026 (§4.7 Goals : résultat objectif passé, temps/place/note, affichage tuile, création date passée)

### **docs/DESIGN_SYSTEM.md** ⭐
- **Contenu :** Tokens (couleurs, typo, espacements), composants (Button, Input, Badge, TileCard, DashboardPageShell, Modal, etc.), guidelines UI, exemples de code, §7 breakpoints (calendrier, chat, Trouver mon coach, My offers)
- **Utiliser pour :** Créer ou modifier des composants UI, choisir des couleurs, appliquer le design system, règles responsive par page
- **Taille :** ~850 lignes
- **Dernière mise à jour :** 2 mars 2026 (DatePickerPopup : popover, liste des mois mois actuel → +2 ans ; Dropdown panneau scroll max-h-64)

### **docs/I18N.md** ⭐
- **Contenu :** Internationalisation (bilingue FR/EN), next-intl, structure messages, namespaces, utilisation dans composants et server actions, **checklist pour nouvelles features** (toujours penser bilingue)
- **Utiliser pour :** Toute nouvelle feature ou texte visible, ajout de clés de traduction, dépannage i18n
- **Taille :** ~180 lignes
- **Dernière mise à jour :** 2 mars 2026 (common.changeLanguage, LanguageSwitcher aria-label)

### **docs/AUTH_EMAIL_TEMPLATES.md**
- **Contenu :** Guide de configuration des emails d’auth Supabase (sujet, i18n FR/EN, variables, dépannage logo). **Les fichiers HTML des templates** (Confirm signup, puis Magic Link, Reset Password, etc.) sont dans **docs/email-templates/**.
- **Utiliser pour :** Configurer les templates dans le dashboard Supabase (Auth → Email Templates) ; copier le contenu des fichiers depuis **docs/email-templates/**.
- **Dernière mise à jour :** 26 février 2026

### **docs/email-templates/** (dossier)
- **Contenu :** Templates HTML des emails Supabase (confirm-signup.html, etc.), index dans README.md. Un seul dossier pour tous les types d’emails pour faciliter le suivi.
- **Utiliser pour :** Récupérer le Body à coller dans Supabase pour chaque type d’email (Confirm signup, Magic Link, Reset Password, etc.).
- **Dernière mise à jour :** 26 février 2026

---

## 🛠️ Documentation Patterns & Conventions

### **docs/PATTERN_SAVE_BUTTON.md**
- **Contenu :** Pattern standard pour boutons de sauvegarde avec états (idle/saving/success/error)
- **Utiliser pour :** Implémenter des boutons de sauvegarde cohérents
- **Taille :** 441 lignes

### **.cursor/rules/project-core.mdc** ⭐
- **Contenu :** Règles de code principales, philosophie MVP-first, design tokens, **i18n (toujours penser bilingue)**, conventions, patterns (Error boundaries, Logger, DashboardPageShell, etc.)
- **Utiliser pour :** Conventions de code, règles automatiques Cursor AI
- **Type :** Always-applied workspace rule
- **Taille :** ~230 lignes
- **Dernière mise à jour :** 16 février 2026

### **.cursor/rules/save-button-pattern.mdc**
- **Contenu :** Règle Cursor pour pattern de bouton de sauvegarde
- **Utiliser pour :** Référence automatique pour l'IA lors de création de boutons

### **.cursor/rules/workflow-personas.mdc** ⭐
- **Contenu :** Workflow Designer → Architecte → Développeur → Analyste ; comportement de chaque personna (questions PO, mockups, user stories, spec technique, implémentation, mise à jour doc)
- **Utiliser pour :** Travailler en mode Designer, Architecte, Développeur ou Analyste ; l'IA adopte le personna selon la demande du PO
- **Type :** Always-applied workspace rule
- **Référence détaillée :** `docs/WORKFLOW_PERSONAS.md`

### **docs/WORKFLOW_PERSONAS.md**
- **Contenu :** Workflow complet en 4 personnas (Designer, Architecte, Développeur, **Analyste**), livrables, **checklists avant livraison**, règle **Garder / Fusionner / Archiver** pour docs de feature, où transférer l'info avant archivage, allers-retours PO
- **Utiliser pour :** Comprendre le processus, formuler les demandes (Mode Designer / Architecte / Développeur / Analyste), référence pour l'IA ; **Mode Analyste** = mise à jour doc après livraison, transfert info puis archivage (voir DOCS_INDEX et liste des docs dans ce fichier)
- **Taille :** ~220 lignes
- **Dernière mise à jour :** 19 février 2026 (ajout personna Analyste)

### **docs/ARCHI_FREEZE_OFFER_I18N.md**
- **Contenu :** Note d’architecture : freeze du titre et de la description d’offre en **FR et EN** au moment de la demande et dans les souscriptions (actuellement une seule langue est figée)
- **Utiliser pour :** Évolution modèle (coach_requests, subscriptions) et code (createCoachRequest, respondToCoachRequest, affichage) pour figer et afficher les deux langues
- **Créé le :** 19 février 2026



## 🚀 Documentation Opérationnelle

### **DEPLOYMENT_NOTES.md**
- **Contenu :** Notes et procédures de déploiement, **URL production https://mysportally.com**
- **Utiliser pour :** Déployer l'application, résoudre des problèmes de déploiement

### **MISE_EN_PROD.md**
- **Contenu :** Checklist et étapes pour mise en production, **URL production https://mysportally.com**
- **Utiliser pour :** Préparer une release production

### **DOCUMENTATION_UPDATE_2026-02-13.md**
- **Contenu :** Récapitulatif de la mise à jour complète de la documentation (13 février 2026)
- **Utiliser pour :** Comprendre les changements récents dans la documentation
- **Taille :** ~300 lignes

---

## 📂 Archives (Historique - READ-ONLY)

> **Tous les documents d'audit, de refactoring et d'états des lieux ont été archivés dans `docs/archive/`**  
> Ils servent de référence historique mais ne sont plus nécessaires au quotidien.

### Documents archivés (39 fichiers)

**Audit & Plan initial :**
- `AUDIT_COMPLET.md` - Audit complet du projet (13 février 2026) - 1202 lignes
- `PLAN_AMELIORATION.md` - Plan d'amélioration détaillé - 1907 lignes

**Refactorings complétés (Sprint 1-3) :**
- `SPRINT_1_FONDATIONS_COMPLETE.md` - Récapitulatif sprint 1
- `REFACTORING_P0_COMPLETE.md` - Utilitaires date/string
- `REFACTORING_P0_AUTH_COMPLETE.md` - Helpers auth centralisés
- `REFACTORING_P0_P2_COMPLETE.md` - Validation + logger + nettoyage
- `REFACTORING_P1_MODALS_COMPLETE.md` - Consolidation modales
- `REFACTORING_P2_P1_SEO_FORMS.md` - SEO + styles formulaires
- `REFACTORING_P1_P2_COMPLETE.md` - Session finale (5 tâches) ⭐

**États des lieux & Simplifications :**
- `MODALES_ETAT_DES_LIEUX_FINAL.md` - État des lieux modales (5 février 2026)
- `SIMPLIFICATION_athlete_comments.md` - Simplification commentaires
- `STANDARDISATION_save_button.md` - Standardisation boutons

**Bug fixes appliqués :**
- `BUGFIX_workout_modal_save_button.md`
- `BUGFIX_comment_button_success_state.md`
- `BUGFIX_athlete_comments_v2.md`
- `BUGFIX_athlete_comments.md`

**Correctif envoi demande coach (archivé 22 février 2026) :**
- `docs/archive/bugfix-coach-request-envoi/ARCHI_COACH_REQUEST_ENVOI_BLOQUE_ANALYSIS.md` — Analyse Architecte (blocage « Envoi en cours », try/catch client + serveur, logs insert)
- **Raison :** Correctif livré ; comportement décrit dans **Project_context.md §4.4** (Flow, gestion d’erreur envoi demande).

### Pourquoi archivés ?

✅ **Tâches complétées :** 13/17 tâches de l'audit terminées (76%)  
✅ **Code refactorisé :** Tous les changements sont appliqués dans le code  
✅ **Score qualité atteint :** 8.3/10 (objectif atteint)  
✅ **Documentation à jour :** Toute l'information pertinente est dans les docs actives

**Issue #43 – Tuile offre archivée (archivés 21 février 2026) :**
- `docs/archive/issue-43/ISSUE_43_ARCHIVED_OFFER_TILE_SPEC.md` — Spec technique (alignement UI tuile offre archivée / souscription archivée)
- `docs/archive/issue-43/ARCHI_TILE_COMPONENT_ANALYSIS.md` — Analyse Architecte (extension TileCard, badge, stone)
- **Raison :** Feature livrée ; tuiles unifiées via **TileCard** (`leftBorderColor="stone"`, `badge`). Comportement décrit dans **docs/DESIGN_SYSTEM.md** § TileCard.

**Calendrier mobile issue #44 (archivés 21 février 2026) :**
- `docs/archive/calendar-mobile-44/CALENDAR_MOBILE_ISSUE_44_DESIGN.md` — Analyse Designer (besoin, réponses PO, mockup)
- `docs/archive/calendar-mobile-44/CALENDAR_MOBILE_ISSUE_44_SPEC.md` — Spec technique (Mode Architecte)
- `docs/archive/calendar-mobile-44/calendar-mobile-mockup.html` — Mockup HTML non fonctionnel
- **Raison :** Feature livrée ; comportement décrit dans **Project_context.md §4.5** et **docs/DESIGN_SYSTEM.md** (guideline §7 Calendrier responsive).

**Total de la semaine sur mobile (calendrier) (archivés 23 février 2026) :**
- `docs/archive/calendar-mobile-weekly-total/calendar-mobile-weekly-total.md` — Design (besoin, 3 solutions UI, choix Solution A)
- `docs/archive/calendar-mobile-weekly-total/calendar-mobile-weekly-total-mockups.html` — Mockups HTML (A, B, C)
- **Raison :** Feature livrée ; bloc totaux (volume horaire total + barres par sport) affiché sur mobile comme en mode étendu desktop. Comportement décrit dans **Project_context.md §4.5** et **docs/DESIGN_SYSTEM.md** §7.

**Indicateur commentaire athlète sur tuile calendrier (archivés 23 février 2026) :**
- `docs/archive/calendar-tile-comment-indicator/calendar-tile-comment-indicator-mockups.html` — Mockups HTML (3 solutions, Solution 1 retenue)
- `docs/archive/calendar-tile-comment-indicator/calendar-tile-comment-indicator-solution1-user-stories.md` — User stories (US1–US3, critères d’acceptation)
- **Raison :** Feature livrée ; icône commentaire en fin de ligne métadonnées sur tuile et carte détaillée. Comportement décrit dans **Project_context.md §4.5** et **docs/DESIGN_SYSTEM.md** §7.

**Filtre par nom (Mes athlètes, coach) (archivés 23 février 2026) :**
- `docs/archive/coach-athletes-filter/coach-athletes-filter-by-name.md` — Design + user stories (solution A : champ inline, accents e/é, titres avec count)
- `docs/archive/coach-athletes-filter/coach-athletes-filter-by-name-SPEC.md` — Spec technique (CoachAthletesListWithFilter, page dashboard, i18n)
- `docs/archive/coach-athletes-filter/coach-athletes-filter-mockup.html` — Mockup HTML (Solution A + état aucun résultat)
- **Raison :** Feature livrée ; filtre par nom sur la section « Mes athlètes » (temps réel, insensible accents), titre page sans count, effectifs à côté des titres de section. Comportement décrit dans **Project_context.md** (§ Coach), **docs/DESIGN_SYSTEM.md** §7.

**Vue souscription, résiliation, « En résiliation » (archivés 21 février 2026) :**
- `docs/archive/subscription-view-end/SUBSCRIPTION_VIEW_AND_END_DESIGN.md` — Brief design + user stories (vue et résiliation)
- `docs/archive/subscription-view-end/SUBSCRIPTION_VIEW_AND_END_SPEC.md` — Spec technique (Mode Architecte)
- `docs/archive/subscription-view-end/SUBSCRIPTION_CANCELLATION_SCHEDULED_DESIGN.md` — Brief design « En résiliation » (badge ambre, annulation résiliation)
- `docs/archive/subscription-view-end/SUBSCRIPTION_CANCELLATION_SCHEDULED_ARCHI_ANALYSIS.md` — Analyse Architecte « En résiliation »
- **Raison :** Features livrées ; comportement décrit dans **Project_context.md §4.10** (Subscription view, end, and cancellation scheduled) et data model §5.

**Filtre par nom/prénom (Trouver mon coach) (archivés 23 février 2026) :**
- `docs/archive/find-coach-name-search/PROPOSAL_FIND_COACH_NAME_SEARCH.md` — Proposition Designer (besoin, 3 solutions UI, choix PO)
- `docs/archive/find-coach-name-search/USER_STORIES_FIND_COACH_NAME_SEARCH.md` — User stories (US 1–3, critères d’acceptation)
- `docs/archive/find-coach-name-search/ARCHI_FIND_COACH_NAME_SEARCH.md` — Spec technique (Mode Architecte)
- `docs/archive/find-coach-name-search/MOCKUP_FIND_COACH_NAME_SEARCH.html` — Mockups HTML (3 propositions)
- **Raison :** Feature livrée ; comportement décrit dans **Project_context.md** (Athlete – Search coaches) et **docs/DESIGN_SYSTEM.md** §7 (bloc Filtres, breakpoint md).

**Voir la demande envoyée (athlète) (archivés 22 février 2026) :**
- `docs/archive/athlete-view-sent-request/ATHLETE_VIEW_SENT_REQUEST_DESIGN.md` — Design + user stories (tuile footer, modale détail)
- `docs/archive/athlete-view-sent-request/ATHLETE_VIEW_SENT_REQUEST_ARCHI.md` — Spec technique (getCoachRequestDetail, AthleteSentRequestDetailModal)
- `docs/archive/athlete-view-sent-request/athlete-view-sent-request-mockup.html` — Mockup HTML (tuile + modale)
- **Raison :** Feature livrée ; comportement décrit dans **Project_context.md §4.4** (Flow : demande pending, « Demande envoyée > », modale détail).

**Template email auth – design (archivé 26 février 2026) :**
- `docs/archive/design-email-template/` — Mockups HTML (A hero, B minimal, C marketing), README_DESIGN_EMAIL_TEMPLATE.md (besoin, 3 options, composants, images libres).
- **Raison :** Template B retenu et intégré dans **docs/email-templates/confirm-signup.html** ; guide dans **docs/AUTH_EMAIL_TEMPLATES.md**. Référence courante : **docs/email-templates/** et **AUTH_EMAIL_TEMPLATES.md**.

**Succès inscription et compte existant (archivés 26 février 2026) :**
- `docs/archive/auth-signup-success/auth-signup-success-US.md` — User stories (état succès modale, email renvoyé, compte existant → connexion avec message + email pré-rempli).
- `docs/archive/auth-signup-success/ARCHI_AUTH_SIGNUP_SUCCESS.md` — Spec technique (identities, SignupState successType/email, i18n, pas de changement BDD/RLS).
- `docs/archive/auth-signup-success/auth-signup-success-mockup.html`, `auth-login-existing-account-mockup.html` — Mockups HTML.
- **Raison :** Feature livrée ; comportement décrit dans **Project_context.md §4.1** (Signup success). Référence courante : **Project_context.md §4.1**.

**Atterrissage après confirmation email (archivés 26 février 2026) :**
- `docs/archive/design-email-confirmation-landing/` — DESIGN_EMAIL_CONFIRMATION_LANDING.md, USER_STORIES_EMAIL_CONFIRMATION_LANDING.md, SPEC_EMAIL_CONFIRMATION_LANDING.md, mockup-email-confirmation-landing.html (Option B : modale « Email validé » avec formulaire connexion).
- **Raison :** Feature livrée ; callback redirige vers `/[locale]/?emailConfirmed=1`, modale EmailValidatedModal sur la page d’accueil, erreur → login?error=confirmation_failed. Comportement décrit dans **Project_context.md §4.1** (Email confirmation landing) et **docs/DESIGN_SYSTEM.md** § Modal (EmailValidatedModal, HomeEmailConfirmedTrigger).

**En-tête public page réinitialisation mot de passe (archivés 27 février 2026) :**
- `docs/archive/design-reset-password-header/` — DESIGN_RESET_PASSWORD_HEADER.md (contexte, 2 solutions UI), reset-password-solution-1-header.html, reset-password-solution-2-context-link.html (mockups HTML).
- **Raison :** Feature livrée ; page reset-password et page d’accueil partagent le même en-tête (composant **PublicHeader** : logo, LanguageSwitcher, AuthButtons). Comportement décrit dans **Project_context.md §4.1** (Password reset) et **docs/DESIGN_SYSTEM.md** § PublicHeader.

**Sélecteur de semaine calendrier (archivés 27 février 2026) :**
- `docs/archive/design-week-selector-two-lines/` — DESIGN_WEEK_SELECTOR_TWO_LINES.md (contexte, 2 solutions), solution-1-two-lines-compact.html, solution-2-two-lines-hierarchy.html (mockups HTML).
- **Raison :** Feature livrée ; sélecteur de semaine responsive (deux lignes sous md, une ligne à partir de md), largeurs fixes, dates dans les boutons à partir de 400px. Comportement décrit dans **Project_context.md §4.5** (Week selector) et **docs/DESIGN_SYSTEM.md** §7 (Sélecteur de semaine).

**Statut de réalisation des séances (workout status) (archivés 27 février 2026) :**
- `docs/archive/design-workout-status/` — DESIGN_WORKOUT_STATUS.md, USER_STORIES_WORKOUT_STATUS.md, SPEC_WORKOUT_STATUS.md, workout-status-mockup.html.
- **Raison :** Feature livrée ; statut planifié / réalisé / non réalisé, modales athlète (titre séance, statut + commentaire) et coach (création/édition avec date en en-tête, lecture seule si passé ou réalisé), totaux « fait » avec déduplication Strava (même jour, même type). Comportement décrit dans **Project_context.md §4.5** (Workouts, Total « fait »), **docs/DESIGN_SYSTEM.md** (Modal headerRight, WorkoutModal), **docs/I18N.md** (workouts).

**Tri liste athlètes par nom / date planifiée (archivés 1er mars 2026) :**
- `docs/archive/design-athletes-sort-by-planned-until/` — DESIGN.md, mockup-sort-controls.html.
- **Raison :** Feature livrée ; page « Mes athlètes » : tri par nom (A–Z) ou date planifiée, menu « Trier par » (Dropdown), recherche (SearchInput). Page « Trouver mon coach » utilise SearchInput. Comportement : **Project_context.md** (§ Coach), **docs/DESIGN_SYSTEM.md** (§ SearchInput, § Dropdown).

**En-tête modale entraînement – tuile sport / date à gauche (archivés 2 mars 2026) :**
- `docs/archive/design-workout-modal-sport-header/` — index.html, mockup-a-badge-header.html, mockup-b-pill-tile-header.html, mockup-c-icon-only-header.html (3 designs, option B retenue).
- **Raison :** Feature livrée ; modale création/édition coach : date à gauche, statut à droite (pas de titre ni icône check) ; modale lecture seule (athlète / coach passé) : tuile pill sport + titre à gauche, statut à droite, corps sans ligne « date · sport » ; largeur modale workout 644px ; titre peut passer sur deux lignes sur petit écran. Comportement décrit dans **Project_context.md §4.5** (Coach can / Athlete can), **docs/DESIGN_SYSTEM.md** (Modal : taille workout, iconRaw, titleWrap).

**Calendrier / sélecteur de date (modale entraînement modifiable) (archivés 2 mars 2026) :**
- `docs/archive/design-workout-modal-calendar/` — DESIGN.md (placement champ date, 3 solutions A/B/C), DESIGN_CALENDAR_POPUP.md (design popup calendrier), mockup-calendar-popup.html, mockup-calendar-solutions.html.
- **Raison :** Feature livrée ; DatePickerPopup en popover sous le champ date, liste des mois = mois actuel → +2 ans, Dropdown avec scroll. Comportement décrit dans **Project_context.md §4.5** (Create & edit modal), **docs/DESIGN_SYSTEM.md** § DatePickerPopup, § Dropdown.

**Moment de la journée (Matin / Midi / Soir) – entraînements et calendrier (archivés 2 mars 2026) :**
- `docs/archive/design-workout-time-of-day/` — DESIGN.md (besoin, cas, user stories US1–US5), SPEC_TIME_OF_DAY.md (migration, types, RLS, fichiers, logique métier), MOCKUP_FORM_TIME_OF_DAY.html, MOCKUP_CALENDAR_DAY_ORDER.html.
- **Raison :** Feature livrée ; coach peut renseigner optionnellement le moment (segments Non précisé | Matin | Midi | Soir) ; calendrier et modale « Activités du jour » affichent la journée en sections (premier bloc sans titre, puis Matin / Midi / Soir avec titre si non vide). Comportement décrit dans **Project_context.md §4.5** (Workouts, Calendar day structure), **docs/DESIGN_SYSTEM.md** (WorkoutModal, §7 Calendrier), **docs/I18N.md** (workouts.form.timeOfDay*, calendar.morning/noon/evening).

**Retour athlète après séance (workout feedback) (archivés 3 mars 2026) :**
- `docs/archive/design-workout-feedback/` — DESIGN.md (besoin, échelles 1–5 / 1–10, Lucide, harmonisation visuelle), SPEC_ARCHITECTURE.md (migration 054, champs perceived_*), MOCKUP_WORKOUT_FEEDBACK_MODAL_A.html, MOCKUP_WORKOUT_FEEDBACK_MODAL_B.html.
- **Raison :** Feature livrée ; athlète peut renseigner optionnellement (quand statut = Réalisé) : Comment vous êtes-vous senti ? (1–5), Intensité effort (1–10), Plaisir (1–5) ; icônes Lucide + libellés ; sauvegarde avec statut et commentaire ; coach voit le retour en lecture seule. Comportement décrit dans **Project_context.md §4.5** (Workouts), **docs/DESIGN_SYSTEM.md** (Modal / WorkoutModal), **docs/I18N.md** (workouts.feedback).

**Résultat objectif passé (goal result) (archivés 3 mars 2026) :**
- `docs/archive/design-goal-result/` — DESIGN.md (besoin, cas, réponses PO), SPEC_GOAL_RESULT.md (migration 053, RLS, fichiers), MOCKUP_GOAL_RESULT_MODAL.html, MOCKUP_GOAL_RESULT_TILE.html.
- **Raison :** Feature livrée ; athlète peut saisir ou modifier un résultat (temps h/min/s, place, note) pour tout objectif dont la date est passée ; modale titre = nom de la course ; affichage sur tuile « distance · temps · place » ; création d’objectif avec date passée autorisée ; coach lecture seule. Comportement décrit dans **Project_context.md §4.7** (Goals), **docs/DESIGN_SYSTEM.md** (TileCard / Page Objectifs), **docs/I18N.md** (goals.result*, goals.validation).

**Disponibilités / indisponibilités athlète (archivés 2 mars 2026) :**
- `docs/archive/design-athlete-availability/` — DESIGN.md (besoin, cas d’usage, décisions PO, style tuiles option D), SPEC_ARCHITECTURE.md (modèle, RLS, fichiers), MOCKUP_AVAILABILITY_MODAL.html, MOCKUP_CALENDAR_AVAILABILITY_TILES.html.
- **Raison :** Feature livrée **sans récurrence** ; athlète peut créer/éditer/supprimer des créneaux disponibilité ou indisponibilité par jour (bouton « + » sur jours futurs, modale avec type, date, Début/Fin optionnels, Note) ; coach voit les tuiles en lecture seule sur le calendrier de l’athlète (modale détail). Comportement décrit dans **Project_context.md §4.5** (Athlete availability), **docs/DESIGN_SYSTEM.md** (§7 Calendrier, AvailabilityModal, AvailabilityDetailModal), **docs/I18N.md** (namespace availability).

**Séparation pages dashboard – find-coach / Mes athlètes (archivé 23 février 2026) :**
- `docs/archive/dashboard-pages-separation/SPEC_ARCHI_DASHBOARD_PAGES_SEPARATION.md` — Spec architecture (redirections depuis /dashboard, pages dédiées, skeletons)
- **Raison :** Feature livrée ; comportement décrit dans **Project_context.md §4.0** (Dashboard entry point) et **docs/DESIGN_SYSTEM.md** §7 (pages Trouver mon coach, Mes athlètes).

**Nom et prénom athlète obligatoires à la demande (archivés 23 février 2026) :**
- `docs/archive/request-athlete-name/DESIGN_REQUEST_ATHLETE_NAME.md` — Design (besoin, solutions A/B/C, choix B, vérification au clic « Voir le détail »)
- `docs/archive/request-athlete-name/design-request-athlete-name/` — Mockups HTML (index, B en contexte détail coach, C étape 1/2)
- **Raison :** Feature livrée ; comportement décrit dans **Project_context.md §4.4** (Flow : vérification au détail coach, champs Prénom/Nom si profil incomplet, mise à jour profil puis demande).

**Migrations i18n (archivées 16 février 2026) :**
- `I18N_IMPLEMENTATION.md` - Implémentation de base i18n (contenu consolidé dans docs/I18N.md)
- `STATUT_MIGRATION_I18N.md` - Statut des pages migrées
- `HOTFIX_I18N_PROXY.md` - Correctif proxy + i18n
- `MIGRATION_OFFRES_COMPLETE.md`, `MIGRATION_MES_ATHLETES_COMPLETE.md`, `MIGRATION_MON_COACH_COMPLETE.md`, `MIGRATION_APPAREILS_CONNECTES_COMPLETE.md`, `MIGRATION_CHAT_COMPLETE.md`, `MIGRATION_SPORTS_I18N_COMPLETE.md` - Récaps par feature

**Chat – Coach peut démarrer une conversation (archivés 22 février 2026) :**
- `docs/archive/chat-coach-start-conversation/CHAT_COACH_START_CONVERSATION_DESIGN.md` — Design + user stories (états 1, 2a, 2b, 3, mobile)
- `docs/archive/chat-coach-start-conversation/CHAT_COACH_START_CONVERSATION_ARCHI.md` — Spec technique (flux, actions serveur, RLS, tests)
- `docs/archive/chat-coach-start-conversation/chat-coach-start-conversation-mockup.html` — Mockup HTML (overlay desktop/mobile)
- **Raison :** Feature livrée ; comportement courant documenté dans **Project_context.md §4.6** et breakpoint responsive dans **docs/DESIGN_SYSTEM.md §7**.

- `docs/archive/architecture-calendar-loading-analysis.md` — Analyse Architecte (chargement calendrier athlète : flux, coûts, pistes d’amélioration : getCalendarData, refetch après save, goals par plage).
- **Raison :** Référence pour évolution performance ; pas encore implémenté.

**Tuile demandes en attente (coach) – archivés 24 février 2026 :**
- `docs/archive/design-pending-request-tile/USER_STORIES_PENDING_REQUEST_TILE.md` — User stories (US 1–7 : tuile uniformisée, message pleine largeur, Discuter, Refuser/Accepter, responsive, modales confirmation).
- `docs/archive/design-pending-request-tile/SPEC_ARCHI_PENDING_REQUEST_TILE.md` — Spec technique (OpenChatContext, PendingRequestTile, ChatModule, layout, i18n).
- `docs/archive/design-pending-request-tile/MOCKUP_PENDING_REQUEST_TILE.html` — Mockup HTML (tuiles, exemple mobile, modales Refuser/Accepter).
- **Raison :** Feature livrée ; comportement décrit dans **Project_context.md §4.4** (Flow : pending requests tile, Discuter, modales) et **docs/DESIGN_SYSTEM.md** §7 (Mes athlètes – Demandes en attente).

**Tuile Profil sidebar (état sélectionné + centrage) – archivés 24 février 2026 :**
- `docs/archive/design-sidebar-profile-tile/MOCKUP_SIDEBAR_PROFILE_TILE.html` — Mockup HTML (tuile Profil : état non sélectionné / sélectionné, sidebar repliée).
- `docs/archive/design-sidebar-profile-tile/SPEC_SIDEBAR_PROFILE_TILE.md` — Spec technique (path === '/dashboard/profile', classes état sélectionné, tests manuels).
- **Raison :** Feature livrée ; la tuile Profil en bas de la sidebar affiche le même état sélectionné que les autres pages lorsque l’utilisateur est sur `/dashboard/profile` ; en mode replié, seul l’avatar est affiché et centré. Comportement décrit dans **Project_context.md §4.0** et **docs/DESIGN_SYSTEM.md** §7 (Sidebar dashboard).

**Ces documents restent disponibles dans `docs/archive/` pour référence historique si besoin.**

**Prix offre non modifiable après publication – archivés 24 février 2026 :**
- `docs/archive/offers-price-frozen/spec_offers_price_frozen_when_published.md` — Spec technique (Mode Architecte : trigger BDD, saveOffers sans price/price_type si published, UI lecture seule).
- `docs/archive/offers-price-frozen/mockup_offer_tile_price_readonly.html` — Mockups HTML (Solutions A, B, C ; Solution B retenue : ligne compacte + badge « Non modifiable »).
- **Raison :** Feature livrée ; trigger `coach_offers_prevent_price_change_when_published`, formulaire offres : tarification en lecture seule pour offres publiées (ligne compacte + badge), modale de confirmation avant publication (message « prix non modifiable », corrections typos uniquement). Comportement décrit dans **Project_context.md §4.4** (Offers) et **docs/DESIGN_SYSTEM.md** (formulaire offres, zone tarification read-only).

**Ces documents restent disponibles dans `docs/archive/` pour référence historique si besoin.**

---

## 📊 État Actuel du Projet

### Score & Progression

| Métrique | Valeur | Statut |
|----------|--------|--------|
| **Score qualité** | 8.3/10 | 🟢 Production-ready |
| **Tâches P0 (Critique)** | 3/3 (100%) | ✅ Complété |
| **Tâches P1 (Important)** | 5/5 (100%) | ✅ Complété |
| **Tâches P2 (Recommandé)** | 5/5 (100%) | ✅ Complété |
| **Tâches P3 (Futur)** | 0/4 (0%) | ⏳ Optionnel |
| **Progression totale** | 13/17 (76%) | 🟢 Excellent |

### Composants & Utilitaires Créés

**Composants UI :**
- `DashboardPageShell` - Shell pour pages dashboard
- `IconClose` - Icône de fermeture réutilisable
- `Modal` - Composant modal centralisé (amélioré)

**Utilitaires Lib :**
- `lib/dateUtils.ts` - Manipulation dates
- `lib/stringUtils.ts` - Manipulation strings
- `lib/authHelpers.ts` - Helpers authentification
- `lib/workoutValidation.ts` - Validation workouts
- `lib/authErrors.ts` - Gestion erreurs auth
- `lib/formStyles.ts` - Styles formulaires
- `lib/sportStyles.ts` - Styles sports (étendu)
- `lib/errors.ts` - Types d'erreur structurés
- `lib/logger.ts` - Logger centralisé

**Error Boundaries :**
- `app/error.tsx` - Boundary global
- `app/dashboard/error.tsx` - Boundary dashboard

---

## 🤖 Instructions pour l'IA

### Avant de créer un nouveau document

1. **Lire cet index** pour vérifier si le sujet existe déjà
2. **Poser la question :** "Ce contenu doit-il être ajouté à un document existant ?"
3. **Si nouveau document nécessaire :**
   - Choisir le bon emplacement (`/docs/` vs racine)
   - Utiliser une convention de nommage cohérente
   - **Mettre à jour cet index** avec le nouveau fichier

### Conventions de nommage

| Type de document | Convention | Exemple |
|------------------|------------|---------|
| Documentation technique longue | `/docs/NOM_DESCRIPTIF.md` | `docs/DESIGN_SYSTEM.md` |
| Référence rapide projet | `racine/NOM_MAJUSCULE.md` | `README.md` |
| Pattern / Convention | `/docs/PATTERN_*.md` | `docs/PATTERN_SAVE_BUTTON.md` |
| Règle Cursor | `.cursor/rules/*.mdc` | `.cursor/rules/project-core.mdc` |

### Hiérarchie des sources (ordre de priorité)

1. **`.cursor/rules/project-core.mdc`** → Règles globales (always-applied)
2. **`.cursor/rules/workflow-personas.mdc`** → Comportement par mode (Designer / Architecte / Développeur / Analyste) quand le PO le précise
3. **`README.md`** → Quick start et vue d'ensemble
4. **`Project_context.md`** → Vision produit et architecture
5. **`docs/DESIGN_SYSTEM.md`** → Design system complet
6. **`docs/WORKFLOW_PERSONAS.md`** → Workflow Designer / Architecte / Développeur / Analyste (quand tu travailles en mode personna)
7. **`docs/archive/REFACTORING_P1_P2_COMPLETE.md`** → Récap final refactoring (si besoin historique)

---

## 📝 Template pour ajouter un nouveau document

```markdown
### **nom-du-fichier.md**
- **Contenu :** [Description courte du contenu]
- **Utiliser pour :** [Cas d'usage]
- **Taille :** [Nombre de lignes approximatif]
- **Créé le :** [Date]
```

---

## 🔄 Maintenance

**Fréquence de mise à jour :** À chaque ajout/suppression de documentation

**Dernier scan :** 3 mars 2026  
**Dernier nettoyage :** 3 mars 2026 (archivage design-workout-feedback)

### Changements récents :

✅ **3 mars 2026 – Retour athlète après séance (workout feedback) – Mode Analyste :**
- **Livraison :** L’athlète peut renseigner optionnellement, lorsque le statut de la séance est **Réalisé**, trois retours : **Comment vous êtes-vous senti ?** (échelle 1–5 avec icônes Lucide + libellés), **Intensité de l’effort ressenti :** (1–10 segments), **Plaisir pris pendant la séance :** (1–5, mêmes icônes + libellés). Sauvegarde avec statut et commentaire en une action. Le coach voit le « Retour athlète » en lecture seule dans la modale (icônes + libellés ou X/10). Données : `workouts.perceived_feeling`, `perceived_intensity`, `perceived_pleasure` (migration 054).
- **Fichiers :** `types/database.ts`, `app/[locale]/dashboard/workouts/actions.ts` (saveWorkoutStatusAndComment), `components/WorkoutModal.tsx`, `messages/fr.json`, `messages/en.json`, `supabase/migrations/054_workout_feedback.sql`.
- **Doc :** Project_context.md §4.5 (Workouts, structure + Athlete/Coach), §5 (workouts), DESIGN_SYSTEM (Modal / WorkoutModal – Retour athlète), I18N (workouts.feedback).
- **Archivage :** `docs/design-workout-feedback/` → `docs/archive/design-workout-feedback/` (DESIGN.md, SPEC_ARCHITECTURE.md, MOCKUP_*.html). Référence courante : **Project_context.md §4.5**, **docs/DESIGN_SYSTEM.md**, **docs/I18N.md**.

✅ **3 mars 2026 – Résultat objectif passé (goal result) – Mode Analyste :**
- **Livraison :** L’athlète peut saisir ou modifier un **résultat** pour tout objectif dont la date est passée : modale (titre = nom de la course) avec Temps (3 champs h/min/s, requis), Place (optionnel), Note (optionnel, max 500 car.). Affichage sur tuile : « distance · [icône horloge] temps · place » ; boutons « Saisir le résultat » (outline) / « Modifier le résultat » (secondary). Création d’objectif avec date passée autorisée. Coach : lecture seule du résultat (sidebar calendrier, modale détail). Données : `goals.result_time_*`, `result_place`, `result_note` (migration 053) ; `lib/goalResultUtils.ts`, action `saveGoalResult`.
- **Fichiers :** `app/[locale]/dashboard/objectifs/` (actions, GoalResultModal, ObjectifsTable), `components/CalendarView.tsx`, `components/CoachAthleteCalendarPage.tsx`, `lib/goalResultUtils.ts`, `types/database.ts`, `messages/fr.json`, `messages/en.json`, `supabase/migrations/053_goals_result.sql`.
- **Doc :** Project_context.md §4.7 (Goals), §5 (goals), DESIGN_SYSTEM (TileCard / Page Objectifs), I18N (goals.result*, goals.validation), project-core.mdc (section Objectifs – Résultat).
- **Archivage :** `docs/design-goal-result/` → `docs/archive/design-goal-result/` (DESIGN.md, SPEC_GOAL_RESULT.md, MOCKUP_*.html). Référence courante : **Project_context.md §4.7**, **docs/DESIGN_SYSTEM.md**, **docs/I18N.md**.

✅ **2 mars 2026 – Disponibilités athlète (sans récurrence) – Mode Analyste :**
- **Livraison :** L’athlète peut déclarer des créneaux **disponibilité** ou **indisponibilité** par jour (bouton « + » sur jours futurs) : type (Segments), date (en-tête avec DatePickerPopup), Début/Fin optionnels (Dropdown 15 min), Note. Plusieurs créneaux par jour. Clic sur une tuile → modale d’édition (Supprimer + Enregistrer). Le coach voit les tuiles en **lecture seule** sur le calendrier de l’athlète (modale détail, bouton Fermer). Ordre dans la colonne du jour : disponibilités → objectifs → entraînements → Strava. **Récurrence non implémentée** (un créneau = une date).
- **Fichiers :** `athlete_availability_slots` (migration 052), `lib/availabilityValidation.ts`, `app/[locale]/dashboard/availability/actions.ts`, `components/AvailabilityModal.tsx`, `components/AvailabilityDetailModal.tsx`, `components/CalendarView.tsx`, pages calendrier, namespace i18n `availability`.
- **Doc :** Project_context.md §4.5 (Athlete availability), §5 (athlete_availability_slots), DESIGN_SYSTEM (§7 Calendrier, modales + tuiles), I18N (namespace availability), project-core.mdc (section Disponibilités athlète).
- **Archivage :** `docs/design-athlete-availability/` → `docs/archive/design-athlete-availability/` (DESIGN.md, SPEC_ARCHITECTURE.md, MOCKUP_*.html). Référence courante : **Project_context.md §4.5**, **docs/DESIGN_SYSTEM.md** §7.

✅ **2 mars 2026 – Moment de la journée (Matin / Midi / Soir) – Mode Analyste :**
- **Livraison :** Le coach peut indiquer optionnellement un moment de la journée (Non précisé | Matin | Midi | Soir) sur chaque entraînement (segment dans la modale création/édition). Colonne `workouts.time_of_day` (migration 051). Calendrier et modale « Activités du jour » : journée structurée en sections — premier bloc sans titre (objectifs, entraînements sans moment, Strava), puis sections Matin / Midi / Soir avec titre uniquement si non vides. Modale lecture seule : date + « · Matin » (ou Midi/Soir) si renseigné.
- **Fichiers :** `types/database.ts`, `lib/workoutValidation.ts`, `app/[locale]/dashboard/workouts/actions.ts`, `components/WorkoutModal.tsx`, `components/CalendarView.tsx`, `messages/fr.json`, `messages/en.json`, `supabase/migrations/051_workout_time_of_day.sql`.
- **Doc :** Project_context.md §4.5 (structure Workout, Create & edit modal, Read-only modal, Calendar day structure), §5 (workouts.time_of_day), DESIGN_SYSTEM (WorkoutModal, §7 Calendrier), I18N (workouts.form.timeOfDay*, calendar.morning/noon/evening).
- **Archivage :** `docs/design-workout-time-of-day/` → `docs/archive/design-workout-time-of-day/` (DESIGN.md, SPEC_TIME_OF_DAY.md, MOCKUP_*.html). Référence courante : **Project_context.md §4.5**, **docs/DESIGN_SYSTEM.md**, **docs/I18N.md**.

✅ **2 mars 2026 – LanguageSwitcher basé sur Dropdown – Mode Analyste :**
- **Livraison :** Sélecteur de langue refactoré pour utiliser le composant **Dropdown** : trigger compact (icône globe + code FR/EN + chevron, minWidth 5.5rem), menu « Français » / « English » avec option active en vert (sans coche). Dropdown étendu avec props optionnelles `valueDisplay`, `triggerPrefix`, `showCheckmark`. i18n : clé **common.changeLanguage** pour l’aria-label (FR/EN).
- **Fichiers :** `components/LanguageSwitcher.tsx`, `components/Dropdown.tsx`, `messages/fr.json`, `messages/en.json`, `LanguageSwitcherShowcase.tsx`.
- **Doc :** DESIGN_SYSTEM (Dropdown, LanguageSwitcher), I18N (composant + common.changeLanguage), DOCS_INDEX.

✅ **1er mars 2026 – Tri liste athlètes (nom / date planifiée) + SearchInput et Dropdown – Mode Analyste :**
- **Livraison :** Page « Mes athlètes » : tri par nom (A–Z) ou date planifiée (sans date en premier, croissant) via menu « Trier par ». Nouveaux composants **SearchInput** (recherche, croix verte) et **Dropdown** (trigger + panneau, états sidebar). Page « Trouver mon coach » : recherche nom/prénom en SearchInput. Données : `plannedUntilRaw` pour tri.
- **Fichiers :** `components/SearchInput.tsx`, `components/Dropdown.tsx`, `CoachAthletesListWithFilter.tsx`, `athletes/page.tsx`, `FindCoachSection.tsx`, `globals.css`, messages FR/EN.
- **Doc :** Project_context (§ Coach), DESIGN_SYSTEM (SearchInput, Dropdown), I18N (athletes sortBy*). **Archivage :** `docs/design-athletes-sort-by-planned-until/` → `docs/archive/design-athletes-sort-by-planned-until/`.

✅ **1er mars 2026 – Unité d’affichage natation (m au lieu de km) – Mode Analyste :**
- **Livraison (déjà en code) :** Dans le calendrier, les totaux hebdomadaires et l’affichage des distances pour la **natation** sont en **mètres (m)**, arrondis au mètre près ; les autres sports à distance restent en km.
- **Mises à jour doc :** `Project_context.md` §4.5 (nouveau paragraphe « Unités d’affichage »), `docs/DESIGN_SYSTEM.md` (ActivityTile metadata natation en m ; §7 Calendrier : natation en m).

✅ **27 février 2026 – Statut de réalisation des séances (workout status) – Mode Analyste :**
- **Livraison :** (1) Statut de séance : planifié (défaut), réalisé, non réalisé ; colonne `workouts.status`, migration 050. (2) Athlète : tuiles avec badge statut, modale avec titre = titre séance, date · sport, objectifs, sélecteur 3 segments + commentaire, sauvegarde en une action. (3) Coach : modale création = modale édition (date en en-tête avec mois en lettres, SportTileSelectable, objectifs + description dans même bloc) ; modale lecture seule si date passée ou statut réalisé (titre séance, badge, date · sport, objectifs, commentaire athlète). (4) Totaux « fait » : `getEffectiveWeeklyTotalsFait` = importés Strava + séances réalisées moins doublons (même jour, même type) ; `lib/stravaMapping.ts`. (5) i18n et accessibilité : clés workouts.status.*, form.chooseDate, comments.*, status.ariaLabel.
- **Fichiers :** `components/WorkoutModal.tsx`, `components/CalendarView.tsx`, `components/CalendarViewWithNavigation.tsx`, `app/[locale]/dashboard/workouts/actions.ts`, `lib/stravaMapping.ts`, `supabase/migrations/050_workout_status.sql`, pages calendrier/athlète, messages fr/en.
- **Mises à jour doc :** Project_context.md §4.5 (structure, Athlete/Coach, Total « fait »), §5 (workouts.status), docs/DESIGN_SYSTEM.md (Modal, WorkoutModal), docs/I18N.md (workouts).
- **Archivage :** `docs/design-workout-status/` → `docs/archive/design-workout-status/` (DESIGN, USER_STORIES, SPEC, mockup). Référence courante : **Project_context.md §4.5**, **docs/DESIGN_SYSTEM.md**, **docs/I18N.md**.

✅ **27 février 2026 – Sélecteur de semaine calendrier (Mode Analyste) :**
- **Livraison :** Sélecteur de semaine (WeekSelector) responsive : plage de dates sur une ligne à partir de `md` (768px), sur deux lignes en dessous ; largeurs fixes (zone centrale 80px / 150px, boutons 40px / 80px) pour que la longueur ne varie pas au changement de semaine ; dates « précédente/suivante » dans les boutons affichées à partir de 400px, masquées en dessous pour tenir sur les écrans étroits.
- **Fichiers :** `components/WeekSelector.tsx`.
- **Mises à jour doc :** `Project_context.md` §4.5 (Week selector), `docs/DESIGN_SYSTEM.md` §7 (Sélecteur de semaine).
- **Archivage :** `docs/design-week-selector-two-lines/` → `docs/archive/design-week-selector-two-lines/` (DESIGN_WEEK_SELECTOR_TWO_LINES.md, mockups solution 1 et 2). Référence courante : **Project_context.md §4.5**, **docs/DESIGN_SYSTEM.md** §7.

✅ **26 février 2026 – Auth signup success et email confirmation landing (Mode Analyste) :**
- **Livraison :** (1) Succès inscription : écran succès dédié (nouveau compte / email renvoyé), compte existant validé → connexion avec message + email pré-rempli (modale et page login) ; backend via `data.user.identities`. (2) Email confirmation landing : callback → page d’accueil `?emailConfirmed=1`, modale « Email validé » avec formulaire de connexion (Option B), erreur callback → `/login?error=confirmation_failed`.
- **Mises à jour doc :** Project_context.md §4.1 (Signup success, Email confirmation landing), docs/DESIGN_SYSTEM.md (EmailValidatedModal, HomeEmailConfirmedTrigger), docs/I18N.md (auth, auth.errors).
- **Archivage :** docs auth-signup-success (US, ARCHI, mockups) → docs/archive/auth-signup-success/ ; docs/design-email-confirmation-landing/ → docs/archive/design-email-confirmation-landing/. Référence courante : **Project_context.md §4.1**, **docs/DESIGN_SYSTEM.md** § Modal.

✅ **26 février 2026 – Spec Architecte succès inscription (backend + front) :**
- **Contenu :** Backend distingue nouveau compte vs email renvoyé via `data.user.identities` (Supabase) ; SignupState étendu (`successType`, `email`) ; pas d’insert profil si identities vide ; i18n (accountCreatedSuccess FR, confirmationEmailResent FR/EN). Fichiers : `app/[locale]/login/actions.ts`, messages, `LoginForm`, page login. Voir **docs/ARCHI_AUTH_SIGNUP_SUCCESS.md**.

✅ **26 février 2026 – Succès inscription et compte existant (Mode Designer) :**
- **Besoin :** Après création de compte, afficher un état succès dédié dans la modale ; gérer « email renvoyé » (compte non validé) et « compte existant validé » → basculer sur connexion avec message + email pré-rempli.
- **Livrables :** User stories `docs/auth-signup-success-US.md` (US 1–4), mockups HTML `docs/auth-signup-success-mockup.html` et `docs/auth-login-existing-account-mockup.html`. Référence DOCS_INDEX.

✅ **26 février 2026 – Ménage documentation emails (Mode Analyste) :**
- **Livraison :** Centralisation des templates d’emails Supabase dans un même dossier **docs/email-templates/** (confirm-signup.html + README index). Guide principal reste **docs/AUTH_EMAIL_TEMPLATES.md** (sujet, i18n, variables, dépannage) avec renvoi vers le dossier. Archivage de **docs/design-email-template/** (mockups A/B/C, README design) dans **docs/archive/design-email-template/** — template B retenu, référence courante : **AUTH_EMAIL_TEMPLATES.md** et **docs/email-templates/**.
- **Fichiers :** `docs/email-templates/confirm-signup.html`, `docs/email-templates/README.md` (créés), `docs/AUTH_EMAIL_TEMPLATES.md` (refactorisé, pointe vers le dossier), `docs/archive/design-email-template/` (mockups + README déplacés).

✅ **25 février 2026 – Email de confirmation d’inscription (template Supabase) – Mode Analyste :**
- **Livraison :** Template HTML pour l’email « Confirm signup » Supabase : en-tête avec logo ({{ .SiteURL }}/logo.svg) et nom « My Sport Ally », contenu bilingue FR/EN selon la locale de la page d’inscription. Au signup, la locale est passée dans les metadata (`options.data: { locale }`) pour que le template Go affiche le bon texte.
- **Fichiers :** `app/[locale]/login/actions.ts` (data.locale au signUp), `docs/AUTH_EMAIL_TEMPLATES.md` (créé : template HTML, sujet conditionnel, variables Supabase).
- **Mises à jour doc :** `DOCS_INDEX.md` (référence AUTH_EMAIL_TEMPLATES, changements récents), `Project_context.md` §4.1 (confirmation email), `docs/I18N.md` (emails auth bilingues), `.cursor/rules/project-core.mdc` (référence AUTH_EMAIL_TEMPLATES).

✅ **24 février 2026 – Prix offre non modifiable après publication (Mode Analyste) :**
- **Livraison :** Une fois une offre publiée, le prix et le type de tarification ne sont plus modifiables. Trigger BDD `coach_offers_prevent_price_change_when_published` (migration 049) rejette toute modification de `price`/`price_type` lorsque `status = 'published'`. Côté app : `saveOffers` omet `price` et `price_type` de l’update pour les offres publiées ; formulaire offres affiche la tarification en lecture seule (Solution B : ligne compacte « X € · Type » + badge « Non modifiable » avec icône cadenas). Modale de confirmation avant publication : message indiquant que le prix sera non modifiable et que seules les corrections de typos (titre/description) restent possibles.
- **Fichiers :** `supabase/migrations/049_coach_offers_price_frozen_when_published.sql`, `app/[locale]/dashboard/profile/offers/actions.ts`, `OffersForm.tsx`, `messages/fr.json`, `messages/en.json`.
- **Mises à jour doc :** `Project_context.md` §4.4 (Offers : price locked after publication, trigger, UI read-only, modal), `docs/DESIGN_SYSTEM.md` (formulaire offres : zone tarification read-only pour offres publiées), `docs/I18N.md` (offers : pricingLockedBadge, publishModal).
- **Archivage :** `docs/spec_offers_price_frozen_when_published.md` et `docs/mockup_offer_tile_price_readonly.html` déplacés dans `docs/archive/offers-price-frozen/`. Référence courante : **Project_context.md §4.4**, **docs/DESIGN_SYSTEM.md**.

✅ **24 février 2026 – Tuile Profil sidebar (état sélectionné + centrage) – Mode Analyste :**
- **Livraison :** Sur la page Profil (`/dashboard/profile`), la tuile Profil en bas de la sidebar (avatar + nom) affiche le même état sélectionné que les autres entrées du menu (fond vert, texte blanc, ombre neutre). Sur `/dashboard/profile/offers`, seule l’entrée « Offres » reste sélectionnée. En mode replié (desktop), seul l’avatar est rendu dans le lien Profil pour un centrage correct ; le logo « My Sport Ally » en haut utilise une marge conditionnelle (`ml-3` / `ml-0`) pour rester centré quand la sidebar est repliée.
- **Fichiers :** `components/Sidebar.tsx` (isProfilePage, classes conditionnelles, rendu conditionnel texte/chevron en replié, marge logo, restauration visibilité libellés menu).
- **Mises à jour doc :** `Project_context.md` §4.0 (sidebar profile tile selected state), `docs/DESIGN_SYSTEM.md` §7 (Sidebar dashboard : tuile Profil, logo centré).
- **Archivage :** `docs/design-sidebar-profile-tile/` déplacé dans `docs/archive/design-sidebar-profile-tile/` (MOCKUP, SPEC). Référence courante : **Project_context.md §4.0**, **docs/DESIGN_SYSTEM.md** §7.

✅ **24 février 2026 – Chat : réécriture après déclin/résiliation + RLS (Mode Analyste) :**
- **Livraison :** Le coach (et l’athlète) peuvent à nouveau envoyer des messages dès qu’il existe une **nouvelle** demande en attente ou une **nouvelle** souscription active, même si une demande avait été déclinée ou une souscription terminée auparavant. La conversation est pilotée par la « dernière demande écrivable » pour la paire (pending ou accepted + souscription active/résiliation) : listes des conversations et envoi de message mettent à jour `conversations.request_id` si besoin. Correction RLS : ajout d’une politique **UPDATE** sur `conversations` (`conversations_update_participant`, migration 048) pour autoriser les participants à mettre à jour `request_id` vers une demande écrivable (sans quoi l’UPDATE était refusé et l’INSERT dans `chat_messages` échouait).
- **Fichiers :** `app/[locale]/actions/chat.ts` (getConversationsForCoach, getConversationsForAthlete : calcul can_send via getLatestWritableRequestIdForPair + update request_id ; sendMessage : idem si request actuel non écrivable), `supabase/migrations/048_conversations_update_policy.sql` (créé).
- **Mises à jour doc :** `Project_context.md` §4.6 (règle « latest writable request », réécriture possible après déclin/résiliation), §5 (conversations : politique UPDATE), `DOCS_INDEX.md` (changements récents, dates).

✅ **24 février 2026 – Tuile demandes en attente (coach) – Mode Analyste :**
- **Livraison :** Sur la page « Mes athlètes », la section « Demandes en attente » affiche chaque demande dans une tuile unifiée (style ActivityTile) : bordure gauche ambre, avatar athlète, badges sport, offre (titre + prix), message besoin pleine largeur. Actions : **Discuter** (ouvre l’overlay chat ciblé sur l’athlète), **Refuser** et **Accepter** (chacun ouvre une modale de confirmation avant d’appeler l’API). Responsive : à partir de `sm` les 3 boutons à droite ; en dessous de `sm` les boutons en bas (Discuter pleine largeur, Refuser et Accepter 50/50). Contexte **OpenChatContext** + **DashboardChatWrapper** pour l’ouverture du chat avec un athlète présélectionné.
- **Fichiers :** `PendingRequestTile.tsx` (créé), `OpenChatContext.tsx` (créé), `DashboardChatWrapper.tsx` (créé), `athletes/page.tsx` (utilisation PendingRequestTile), `layout.tsx` (DashboardChatWrapper), `ChatModule.tsx` (openWithAthleteId, onOpenWithAthleteHandled), `actions.ts` (frozen_price_type dans getPendingCoachRequests), `messages/fr.json` et `en.json` (pendingRequests.chat, coachRequests.confirmDeclineTitle/Body, confirmAcceptTitle/Body).
- **Mises à jour doc :** `Project_context.md` §4.4 (Flow : pending request tile, Discuter, modales), `docs/DESIGN_SYSTEM.md` §7 (Demandes en attente, PendingRequestTile), `docs/I18N.md` (athletes, coachRequests).
- **Archivage :** Docs déplacés dans `docs/archive/design-pending-request-tile/` (USER_STORIES, SPEC_ARCHI, MOCKUP). Référence courante : **Project_context.md §4.4**, **docs/DESIGN_SYSTEM.md** §7.

✅ **23 février 2026 – Séparation pages dashboard (find-coach / Mes athlètes) – Mode Analyste :**
- **Livraison :** La route `/dashboard` ne fait plus que des redirections selon le rôle : athlète avec coach → calendar ; athlète sans coach → `/dashboard/find-coach` ; coach → `/dashboard/athletes` ; admin → `/admin/members`. Pages dédiées « Trouver mon coach » (`/dashboard/find-coach`) et « Mes athlètes » (`/dashboard/athletes`) avec chacune son skeleton de chargement. Sidebar : liens directs vers find-coach et athletes ; titre page Mes athlètes = « My Athletes » / « Mes Athlètes ». Grille des tuiles athlètes : 3 colonnes uniquement à partir du breakpoint `xl`.
- **Fichiers :** `dashboard/page.tsx` (redirections), `dashboard/loading.tsx` (skeleton minimal), `dashboard/find-coach/page.tsx` + `loading.tsx`, `dashboard/athletes/page.tsx` + `loading.tsx`, `Sidebar.tsx`, `athletes/[athleteId]/page.tsx` (redirect vers athletes), `actions.ts` (revalidatePath find-coach / athletes), `CoachAthletesListWithFilter.tsx` (grille xl).
- **Mises à jour doc :** `Project_context.md` §4.0 (Dashboard entry point), `docs/DESIGN_SYSTEM.md` §7 (pages dédiées, breakpoints, titre Mes athlètes).
- **Archivage :** Spec déplacée dans `docs/archive/dashboard-pages-separation/`. Référence courante : **Project_context.md §4.0**, **docs/DESIGN_SYSTEM.md** §7.

✅ **23 février 2026 – Nom et prénom athlète obligatoires à la demande (Mode Analyste) :**
- **Livraison :** À l’ouverture de la modale détail coach (« Voir le détail »), si le profil athlète n’a pas prénom et/ou nom, le formulaire de demande affiche les champs Prénom * et Nom * (obligatoires). Le bouton « Envoyer la demande » reste désactivé tant que offre, sports, besoin et (si affichés) prénom/nom ne sont pas renseignés. À l’envoi : mise à jour du profil puis création de la demande. Côté serveur : `createCoachRequest` accepte optionnellement firstName/lastName, met à jour `profiles` si fournis, et refuse la création si le profil n’a pas de nom.
- **Fichiers :** `page.tsx` (passage athleteFirstName/athleteLastName), `FindCoachSection.tsx` (props, CoachDetailModal : champs nom/prénom, validation, bouton désactivé), `actions.ts` (createCoachRequest + params + update profil + vérif nom), `messages/fr.json` et `en.json` (findCoach.validation.requireFirstNameLastName, coachRequests.validation.requireFirstNameLastName).
- **Mises à jour doc :** `Project_context.md` §4.4 (Flow : vérification au détail, champs Prénom/Nom si profil incomplet).
- **Archivage :** `docs/DESIGN_REQUEST_ATHLETE_NAME.md` et `docs/design-request-athlete-name/` déplacés dans `docs/archive/request-athlete-name/`. Référence courante : **Project_context.md §4.4**.

✅ **23 février 2026 – Filtre par nom (Mes athlètes, coach) – Mode Analyste :**
- **Livraison :** Sur le dashboard coach, la section « Mes athlètes » affiche un champ de recherche inline à côté du titre « Mes athlètes (X) ». Filtrage en temps réel par nom affiché (insensible à la casse et aux accents, normalisation NFD). Message « Aucun athlète ne correspond à votre recherche » si 0 résultat. Titre de page : « Tableau de bord » (sans nombre) ; effectifs à côté des titres « Mes athlètes (X) » et « Demandes en attente (X) ».
- **Fichiers :** `CoachAthletesListWithFilter.tsx` (créé), `page.tsx` (titre, pending count, athleteTiles, rendu composant), `messages/fr.json` et `en.json` (nameFilterPlaceholder, noMatchForSearch, myAthletesWithCount, pendingRequests.titleWithCount).
- **Mises à jour doc :** `Project_context.md` (Coach : filter by name), `docs/DESIGN_SYSTEM.md` §7 (Dashboard coach – Mes athlètes), `docs/I18N.md` (namespace athletes).
- **Archivage :** Docs de feature déplacés dans `docs/archive/coach-athletes-filter/`. Référence courante : **Project_context.md** (§ Coach), **docs/DESIGN_SYSTEM.md** §7.

✅ **23 février 2026 – Indicateur commentaire athlète sur tuile calendrier (Mode Analyste) :**
- **Livraison :** Sur les tuiles entraînement du calendrier (carte compacte et carte détaillée modale jour), une icône commentaire en fin de ligne métadonnées (durée, distance, etc.) signale qu’un commentaire athlète est présent. Tooltip et aria-label : `calendar.tile.athleteCommentLabel` (FR/EN).
- **Mises à jour doc :** `Project_context.md` §4.5 (Coach can : voir d’un coup d’œil les entraînements avec commentaire), `docs/DESIGN_SYSTEM.md` §7 (Calendrier : icône commentaire sur tuiles), `docs/I18N.md` (namespace calendar, clé tile.athleteCommentLabel).
- **Archivage :** Docs de feature déplacés dans `docs/archive/calendar-tile-comment-indicator/` (mockups HTML, user stories solution 1). Référence courante : **Project_context.md §4.5**, **docs/DESIGN_SYSTEM.md §7**.

✅ **23 février 2026 – Filtre par nom/prénom (Trouver mon coach) – Mode Analyste :**
- **Livraison :** Sur la page « Trouver mon coach », l’athlète peut filtrer les coachs par nom ou prénom (champ unique, temps réel, contient, insensible à la casse). Le bouton Réinitialiser vide aussi ce champ. Grille Sport coaché / Langue parlée en 2 colonnes à partir de `md` (768px).
- **Mises à jour doc :** `Project_context.md` (Athlete : filter by name), `docs/DESIGN_SYSTEM.md` §7 (bloc Filtres + recherche nom, breakpoint md pour la grille).
- **i18n :** Namespace `findCoach` : clés `filters.nameSearchLabel`, `filters.nameSearchPlaceholder` (FR/EN).
- **Archivage :** Docs de feature déplacés dans `docs/archive/find-coach-name-search/`. Référence courante : **Project_context.md** (Find a coach), **docs/DESIGN_SYSTEM.md** §7.

✅ **23 février 2026 – Responsive grilles (Trouver mon coach + My offers) – Mode Analyste :**
- **Livraison :** Grille « Trouver mon coach » : 1 col par défaut, 2 cols à partir de `md` et en `lg`, 3 cols à partir de `xl` (1280px). Page « My offers » du coach : 1 colonne en tout temps.
- **Mises à jour doc :** `docs/DESIGN_SYSTEM.md` §7 (Breakpoint responsive) : ajout des règles d’affichage pour la liste des tuiles coach et pour la grille des offres coach.

✅ **23 février 2026 – Chat request-driven + lecture seule (Mode Analyste) :**
- **Livraison :** Le chat coach/athlète est autorisé dès qu'une demande est `pending`; le chat devient **lecture seule** quand l'écriture n'est plus autorisée (demande refusée/annulée ou souscription terminée après acceptation).
- **Cycle d'accès chat :** write autorisé pour `pending`; write autorisé pour `accepted` uniquement avec souscription `active`/`cancellation_scheduled`; sinon historique lisible mais envoi bloqué.
- **UX :** L'athlète utilise le même pattern overlay que le coach (liste + sidebar + panel), avec navigation mobile liste ↔ conversation et bouton retour.
- **Mises à jour doc :** `Project_context.md` §4.6 (messaging) et §5 (data model `conversations.request_id`).

✅ **22 février 2026 – Chat coach : démarrer/ouvrir/fermer des conversations (Mode Analyste) :**
- **Livraison :** Le coach peut ouvrir une discussion depuis l’overlay (bouton « Ouvrir une discussion »), rechercher un athlète (déclenchement sur Entrée), ouvrir une conversation existante sans doublon, et fermer une conversation (elle disparaît de la sidebar des conversations ouvertes). Persistance des conversations ouvertes/fermées dans le module.
- **Vue mobile :** Overlay chat responsive aligné sur le breakpoint projet `md` (navigation liste ↔ conversation en mobile, sidebar + panneau en desktop).
- **Mises à jour doc :** Project_context.md §4.6 (messaging coach + mobile + persistance), docs/DESIGN_SYSTEM.md (date + rappel breakpoint `md`), DOCS_INDEX.md (feature chat marquée livrée).
- **Archivage :** docs chat déplacés dans `docs/archive/chat-coach-start-conversation/` (design, archi, mockup). Référence courante : **Project_context.md §4.6**.

✅ **22 février 2026 – Voir la demande envoyée (athlète) – Mode Analyste :**
- **Livraison :** L’athlète peut consulter le détail d’une demande envoyée (pending) : footer tuile « Annuler la demande » + « Demande envoyée > », modale avec offre figée, sports, message, date ; annulation depuis la tuile ou la modale.
- **Mises à jour doc :** Project_context.md §4.4 (phrase sur demande pending + modale détail), docs/I18N.md (namespaces `requestCoachButton`, `athleteSentRequest`, date 22 fév.).
- **Archivage :** ATHLETE_VIEW_SENT_REQUEST_DESIGN.md, ATHLETE_VIEW_SENT_REQUEST_ARCHI.md, athlete-view-sent-request-mockup.html déplacés dans `docs/archive/athlete-view-sent-request/`. Référence courante : **Project_context.md §4.4**.

✅ **22 février 2026 – Correctif envoi demande coach (Mode Analyste) :**
- **Livraison :** Correction du blocage « Envoi en cours » lors de l’envoi d’une demande à un coach (avec offre) : try/catch/finally côté client (FindCoachSection, RequestCoachButton), try/catch global + log erreur insert côté serveur (createCoachRequest).
- **Mise à jour doc :** Project_context.md §4.4 (Flow) : une phrase sur la gestion d’erreur (message utilisateur, pas de blocage).
- **Archivage :** docs/ARCHI_COACH_REQUEST_ENVOI_BLOQUE_ANALYSIS.md déplacé dans `docs/archive/bugfix-coach-request-envoi/`. Référence courante : Project_context.md §4.4.

✅ **21 février 2026 – Vue souscription, résiliation, « En résiliation » (archivage) :**
- **Livraison :** Fonctionnalités subscription view/end et subscription cancellation scheduled implémentées ; doc déjà alignée (Project_context.md §4.10, data model subscriptions).
- **Archivage :** Les 4 docs de feature déplacés dans `docs/archive/subscription-view-end/` : SUBSCRIPTION_VIEW_AND_END_DESIGN.md, SUBSCRIPTION_VIEW_AND_END_SPEC.md, SUBSCRIPTION_CANCELLATION_SCHEDULED_DESIGN.md, SUBSCRIPTION_CANCELLATION_SCHEDULED_ARCHI_ANALYSIS.md.
- **Référence courante :** Project_context.md §4.10 (Subscription view, end, and cancellation scheduled).

✅ **21 février 2026 – Clôture issue #43 (Tuile offre archivée) + Mode Analyste :**
- **Livraison :** Alignement UI tuile offre archivée sur tuile souscription terminée ; extension **TileCard** (`leftBorderColor="stone"`, prop `badge`) ; utilisation dans les 3 écrans (OffersForm, CoachSubscriptionsContent, subscriptions/history).
- **Mises à jour doc :** docs/DESIGN_SYSTEM.md (TileCard : stone, badge, cas d'usage listes archivées/terminées), TileCardShowcase (variante stone).
- **Archivage :** docs ISSUE_43_ARCHIVED_OFFER_TILE_SPEC.md et ARCHI_TILE_COMPONENT_ANALYSIS.md déplacés dans `docs/archive/issue-43/`. Référence courante : docs/DESIGN_SYSTEM.md § TileCard.

✅ **21 février 2026 – Livraison issue #44 (Calendrier mobile) + Mode Analyste + archivage :**
- **Livraison :** Calendrier responsive (breakpoint md) : en-tête 2 lignes, 1 semaine en stack sur mobile (AthleteCalendarPage, CoachAthleteCalendarPage, CalendarView), i18n `calendar.today`.
- **Mises à jour doc :** Project_context.md §4.5 (Calendrier responsive), docs/DESIGN_SYSTEM.md (guideline §7 Calendrier responsive, date 21 fév.), docs/I18N.md (namespace calendar, date 21 fév.), .cursor/rules/project-core.mdc (Last updated 21 fév.).
- **Archivage :** docs CALENDAR_MOBILE_ISSUE_44_DESIGN.md, CALENDAR_MOBILE_ISSUE_44_SPEC.md et calendar-mobile-mockup.html déplacés dans `docs/archive/calendar-mobile-44/`. Comportement décrit dans Project_context §4.5 et DESIGN_SYSTEM.

✅ **21 février 2026 – Workflow Personas (améliorations par rôle) :**
- **docs/WORKFLOW_PERSONAS.md** et **.cursor/rules/workflow-personas.mdc** : renforcement des livrables et checklists pour chaque personna.
- **Designer** : référence mockup par US, liste composants à utiliser/faire évoluer, checklist avant livraison (design system, mockup validé, US liées au mockup), optionnel zones i18n.
- **Architecte** : table des fichiers obligatoire, « aucun changement BDD » si pertinent, section Tests manuels recommandés, points à trancher en implémentation, checklist avant livraison.
- **Développeur** : vérification conformité au mockup (signaler écarts), livrable pour l’Analyste = liste des fichiers créés/modifiés (+ optionnel note de livraison).
- **Analyste** : règle explicite **Garder / Fusionner / Archiver** pour les docs de feature ; où transférer l’info (Project_context, DESIGN_SYSTEM) avant archivage ; cohérence des liens après archivage.

✅ **19 février 2026 – Mise à jour doc (Mode Analyste) – Vue souscription, résiliation, « En résiliation » :**
- Alignement de la documentation sur l'implémentation réalisée.
- **Project_context.md** : nouvelle section 4.10 (Subscription view, end, and cancellation scheduled), mise à jour Data Model `subscriptions` (status, cancellation_requested_by_user_id).
- Mises à jour des docs de feature (depuis archivés dans `docs/archive/subscription-view-end/`).

✅ **19 février 2026 – Personna Analyste (après le Développeur) :**
- Ajout du **personna Analyste** dans le workflow : il intervient après la livraison du Développeur pour mettre à jour l'ensemble de la documentation projet.
- **Rôle :** aligner les docs sur ce qui a été fait, faire le ménage (archiver l'obsolete dans `docs/archive/`), tenir à jour **DOCS_INDEX.md** (dates, changements récents, « Pour trouver rapidement »).
- **Documents à maintenir à jour** (détail dans `docs/WORKFLOW_PERSONAS.md`, section 4) : DOCS_INDEX.md, README.md, Project_context.md, docs/DESIGN_SYSTEM.md, docs/I18N.md, docs/PATTERN_SAVE_BUTTON.md, .cursor/rules/project-core.mdc, docs/WORKFLOW_PERSONAS.md, DEPLOYMENT_NOTES.md, MISE_EN_PROD.md, et docs de feature (archiver si obsolètes).
- Mise à jour **.cursor/rules/workflow-personas.mdc** (section 4 + invocation Analyste) et **docs/WORKFLOW_PERSONAS.md** (section 4, table des docs, handoffs, résumé).

✅ **18 février 2026 – Workflow Personas (Designer / Architecte / Développeur) :**
- Création de **docs/WORKFLOW_PERSONAS.md** : workflow en 3 personnas, livrables, comment lancer chaque mode (Designer, Architecte, Développeur).
- Création de **.cursor/rules/workflow-personas.mdc** (always-applied) : l’IA adopte le comportement du personna selon la demande du PO.
- Mise à jour **DOCS_INDEX.md** : entrées pour WORKFLOW_PERSONAS et workflow-personas.mdc, ligne « Pour trouver rapidement ».

✅ **18 février 2026 – Snapshot offre et souscriptions :**
- Mise à jour **Project_context.md** (section 4.4 Offers, section 5 Data Model) : documentation du snapshot de l’offre à la création de la demande (`coach_requests.frozen_*`), création d’une souscription à l’acceptation avec données figées copiées depuis la request (pas depuis `coach_offers`), table `subscriptions` ajoutée au modèle de données.

✅ **16 février 2026 – Documentation i18n et bilingue :**
- Création de **docs/I18N.md** : référence unique pour l’internationalisation (FR/EN), checklist pour nouvelles features (toujours penser bilingue).
- Mise à jour **.cursor/rules/project-core.mdc** : règle i18n, zéro tolérance pour textes en dur, référence à `docs/I18N.md`.
- Archivage des docs de migration i18n (I18N_IMPLEMENTATION, STATUT_MIGRATION_I18N, HOTFIX_I18N_PROXY, MIGRATION_*.md) dans `docs/archive/`.
- Mise à jour README, Project_context, DOCS_INDEX : mention bilingue, lien vers docs/I18N.md.

✅ **13 février 2026 – Archivé 12 documents** dans `docs/archive/` :
- 2 documents d'audit (AUDIT_COMPLET.md, PLAN_AMELIORATION.md)
- 7 documents de refactoring (REFACTORING_*.md, SPRINT_*.md)
- 3 documents d'états des lieux / simplifications

✅ **Documentation active nettoyée :**
- Gardé uniquement les docs essentiels au quotidien
- README.md, Project_context.md, DESIGN_SYSTEM.md, etc.
- Règles Cursor (.mdc) à jour avec tous les patterns

✅ **Résultat :**
- Documentation claire et concise
- Pas de confusion avec docs obsolètes
- Historique préservé dans archive/

**Fichiers actifs :** 7 fichiers .md + 2 fichiers .mdc  
**Fichiers archivés :** 16 fichiers .md

---

## 🎯 Pour trouver rapidement

| Je cherche... | Consulter... |
|---------------|--------------|
| Comment démarrer le projet | `README.md` |
| Vision produit, rôles | `Project_context.md` |
| Composants UI, couleurs | `docs/DESIGN_SYSTEM.md` |
| **i18n / bilingue / traductions / nouvelles features** | **`docs/I18N.md`** |
| Succès inscription / email validé (modale, landing) | `Project_context.md` §4.1, `docs/DESIGN_SYSTEM.md` § Modal |
| **Workflow Designer / Architecte / Développeur / Analyste** | **`docs/WORKFLOW_PERSONAS.md`** |
| Calendrier responsive / mobile (issue #44) / totaux de la semaine sur mobile | `Project_context.md` §4.5, `docs/DESIGN_SYSTEM.md` §7 |
| **Natation : unité d’affichage (m, pas km)** | **`Project_context.md` §4.5** (Unités d’affichage), **`docs/DESIGN_SYSTEM.md`** (§7 Calendrier, ActivityTile metadata) |
| Indicateur commentaire athlète sur tuile calendrier | `Project_context.md` §4.5, `docs/DESIGN_SYSTEM.md` §7 |
| **Statut séance, modales entraînement (en-tête création/édition/lecture seule, tuile sport, date à gauche), total « fait », retour athlète (ressenti, intensité, plaisir)** | **`Project_context.md` §4.5** (Workouts), **`docs/DESIGN_SYSTEM.md`** (Modal, WorkoutModal) |
| **Moment de la journée (Matin / Midi / Soir), sections calendrier, modale « Activités du jour »** | **`Project_context.md` §4.5** (Calendar day structure, Workout time_of_day), **`docs/DESIGN_SYSTEM.md`** (§7 Calendrier, WorkoutModal) |
| **Disponibilités / indisponibilités athlète (calendrier, modales, pas de récurrence)** | **`Project_context.md` §4.5** (Athlete availability), **`docs/DESIGN_SYSTEM.md`** (§7 Calendrier, AvailabilityModal, AvailabilityDetailModal) |
| **Résultat objectif passé (saisie temps/place/note, modale, affichage tuile)** | **`Project_context.md` §4.7** (Goals), **`docs/DESIGN_SYSTEM.md`** (§ TileCard, Page Objectifs), **`lib/goalResultUtils.ts`** |
| **Calendrier / sélecteur de date (modale entraînement modifiable)** | **`docs/DESIGN_SYSTEM.md`** § DatePickerPopup, § Dropdown ; **Project_context.md** §4.5 (Create & edit modal). Design archivé : `docs/archive/design-workout-modal-calendar/` |
| **Page par défaut / redirections dashboard (find-coach, Mes athlètes)** | **`Project_context.md` §4.0** |
| Tuile Profil sidebar (état sélectionné sur page Profil, centrage mode replié) | `Project_context.md` §4.0, `docs/DESIGN_SYSTEM.md` §7 |
| Tuile demandes en attente (coach) / Discuter / modales Refuser-Accepter | `Project_context.md` §4.4, `docs/DESIGN_SYSTEM.md` §7 |
| **Prix offre non modifiable après publication** (trigger BDD, UI read-only, modale) | **`Project_context.md` §4.4**, **`docs/DESIGN_SYSTEM.md`** (formulaire offres) |
| Grilles responsive (Trouver mon coach, My offers, Mes athlètes) | `docs/DESIGN_SYSTEM.md` §7 |
| Filtre par nom/prénom (Trouver mon coach) | `Project_context.md` (Athlete), `docs/DESIGN_SYSTEM.md` §7 |
| Filtre par nom (Mes athlètes, coach) | `Project_context.md` (§ Coach), `docs/DESIGN_SYSTEM.md` §7 |
| **Tri liste athlètes (nom / date planifiée), SearchInput, Dropdown** | **`Project_context.md`** (§ Coach), **`docs/DESIGN_SYSTEM.md`** (§ SearchInput, § Dropdown) |
| Tuile archivée / offres archivées / historique souscriptions (issue #43) | `docs/DESIGN_SYSTEM.md` § TileCard (stone, badge) |
| **Vue souscription, résiliation, « En résiliation »** | **`Project_context.md` §4.10** |
| Envoi demande coach / erreur ou blocage « Envoi en cours » | `Project_context.md` §4.4 (Flow) |
| **Voir la demande envoyée (athlète) / modale détail demande** | **`Project_context.md` §4.4** (demande pending, « Demande envoyée > », modale) |
| **Chat – Accès via requests, écriture/lecture seule, réécriture après nouveau pending/active** | **`Project_context.md` §4.6** (comportement livré, latest writable request, RLS conversations), + archives: `docs/archive/chat-coach-start-conversation/` |
| Conventions de code | `.cursor/rules/project-core.mdc` |
| Pattern bouton sauvegarde | `docs/PATTERN_SAVE_BUTTON.md` |
| Déploiement | `DEPLOYMENT_NOTES.md`, `MISE_EN_PROD.md` |
| Historique refactoring | `docs/archive/REFACTORING_P1_P2_COMPLETE.md` |
| Historique audit / migrations i18n | `docs/archive/` |

---

**Pour toute question sur la documentation, consulter d'abord cet index.**
