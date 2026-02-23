# 📚 Index de la Documentation

**Dernière mise à jour :** 22 février 2026 (chat coach archivé)

> ⚠️ **Avant de créer un nouveau document, TOUJOURS vérifier cet index pour éviter les doublons !**

---

## 🎯 Documentation Active (à utiliser en priorité)

### **README.md** ⭐
- **Contenu :** Setup projet, stack technique, quick start, structure du projet
- **Utiliser pour :** Onboarding, démarrage rapide, vue d'ensemble technique
- **Taille :** ~200 lignes
- **Dernière mise à jour :** 13 février 2026

### **Project_context.md** ⭐
- **Contenu :** Vision produit, philosophie, rôles (Athlete/Coach/Admin), features actuelles, data model (dont snapshot offre + souscriptions, vue/résiliation, En résiliation), stack technique
- **Utiliser pour :** Comprendre le projet, les features, les rôles, l'architecture globale
- **Taille :** ~400 lignes
- **Dernière mise à jour :** 22 février 2026 (§4.4 voir demande envoyée)

### **docs/DESIGN_SYSTEM.md** ⭐
- **Contenu :** Tokens (couleurs, typo, espacements), composants (Button, Input, Badge, TileCard, DashboardPageShell, Modal, etc.), guidelines UI, exemples de code
- **Utiliser pour :** Créer ou modifier des composants UI, choisir des couleurs, appliquer le design system
- **Taille :** ~850 lignes
- **Dernière mise à jour :** 22 février 2026 (breakpoint responsive projet `md` documenté : calendrier + chat)

### **docs/I18N.md** ⭐
- **Contenu :** Internationalisation (bilingue FR/EN), next-intl, structure messages, namespaces, utilisation dans composants et server actions, **checklist pour nouvelles features** (toujours penser bilingue)
- **Utiliser pour :** Toute nouvelle feature ou texte visible, ajout de clés de traduction, dépannage i18n
- **Taille :** ~180 lignes
- **Dernière mise à jour :** 16 février 2026

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
- **Contenu :** Notes et procédures de déploiement
- **Utiliser pour :** Déployer l'application, résoudre des problèmes de déploiement

### **MISE_EN_PROD.md**
- **Contenu :** Checklist et étapes pour mise en production
- **Utiliser pour :** Préparer une release production

### **DOCUMENTATION_UPDATE_2026-02-13.md**
- **Contenu :** Récapitulatif de la mise à jour complète de la documentation (13 février 2026)
- **Utiliser pour :** Comprendre les changements récents dans la documentation
- **Taille :** ~300 lignes

---

## 📂 Archives (Historique - READ-ONLY)

> **Tous les documents d'audit, de refactoring et d'états des lieux ont été archivés dans `docs/archive/`**  
> Ils servent de référence historique mais ne sont plus nécessaires au quotidien.

### Documents archivés (38 fichiers)

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

**Vue souscription, résiliation, « En résiliation » (archivés 21 février 2026) :**
- `docs/archive/subscription-view-end/SUBSCRIPTION_VIEW_AND_END_DESIGN.md` — Brief design + user stories (vue et résiliation)
- `docs/archive/subscription-view-end/SUBSCRIPTION_VIEW_AND_END_SPEC.md` — Spec technique (Mode Architecte)
- `docs/archive/subscription-view-end/SUBSCRIPTION_CANCELLATION_SCHEDULED_DESIGN.md` — Brief design « En résiliation » (badge ambre, annulation résiliation)
- `docs/archive/subscription-view-end/SUBSCRIPTION_CANCELLATION_SCHEDULED_ARCHI_ANALYSIS.md` — Analyse Architecte « En résiliation »
- **Raison :** Features livrées ; comportement décrit dans **Project_context.md §4.10** (Subscription view, end, and cancellation scheduled) et data model §5.

**Voir la demande envoyée (athlète) (archivés 22 février 2026) :**
- `docs/archive/athlete-view-sent-request/ATHLETE_VIEW_SENT_REQUEST_DESIGN.md` — Design + user stories (tuile footer, modale détail)
- `docs/archive/athlete-view-sent-request/ATHLETE_VIEW_SENT_REQUEST_ARCHI.md` — Spec technique (getCoachRequestDetail, AthleteSentRequestDetailModal)
- `docs/archive/athlete-view-sent-request/athlete-view-sent-request-mockup.html` — Mockup HTML (tuile + modale)
- **Raison :** Feature livrée ; comportement décrit dans **Project_context.md §4.4** (Flow : demande pending, « Demande envoyée > », modale détail).

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

**Dernier scan :** 22 février 2026  
**Dernier nettoyage :** 22 février 2026

### Changements récents :

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
| **Workflow Designer / Architecte / Développeur / Analyste** | **`docs/WORKFLOW_PERSONAS.md`** |
| Calendrier responsive / mobile (issue #44) | `Project_context.md` §4.5, `docs/DESIGN_SYSTEM.md` §7 |
| Tuile archivée / offres archivées / historique souscriptions (issue #43) | `docs/DESIGN_SYSTEM.md` § TileCard (stone, badge) |
| **Vue souscription, résiliation, « En résiliation »** | **`Project_context.md` §4.10** |
| Envoi demande coach / erreur ou blocage « Envoi en cours » | `Project_context.md` §4.4 (Flow) |
| **Voir la demande envoyée (athlète) / modale détail demande** | **`Project_context.md` §4.4** (demande pending, « Demande envoyée > », modale) |
| **Chat – Coach démarrer une conversation (états overlay, sidebar, recherche)** | **`Project_context.md` §4.6** (comportement livré), + archives: `docs/archive/chat-coach-start-conversation/` |
| Conventions de code | `.cursor/rules/project-core.mdc` |
| Pattern bouton sauvegarde | `docs/PATTERN_SAVE_BUTTON.md` |
| Déploiement | `DEPLOYMENT_NOTES.md`, `MISE_EN_PROD.md` |
| Historique refactoring | `docs/archive/REFACTORING_P1_P2_COMPLETE.md` |
| Historique audit / migrations i18n | `docs/archive/` |

---

**Pour toute question sur la documentation, consulter d'abord cet index.**
