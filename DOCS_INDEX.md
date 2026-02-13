# 📚 Index de la Documentation

**Dernière mise à jour :** 13 février 2026

> ⚠️ **Avant de créer un nouveau document, TOUJOURS vérifier cet index pour éviter les doublons !**

---

## 🎯 Documentation Active (à utiliser en priorité)

### **README.md** ⭐
- **Contenu :** Setup projet, stack technique, quick start, structure du projet
- **Utiliser pour :** Onboarding, démarrage rapide, vue d'ensemble technique
- **Taille :** ~200 lignes
- **Dernière mise à jour :** 13 février 2026

### **Project_context.md** ⭐
- **Contenu :** Vision produit, philosophie, rôles (Athlete/Coach/Admin), features actuelles, data model, stack technique
- **Utiliser pour :** Comprendre le projet, les features, les rôles, l'architecture globale
- **Taille :** 363 lignes

### **docs/DESIGN_SYSTEM.md** ⭐
- **Contenu :** Tokens (couleurs, typo, espacements), composants (Button, Input, Badge, DashboardPageShell, Modal, etc.), guidelines UI, exemples de code
- **Utiliser pour :** Créer ou modifier des composants UI, choisir des couleurs, appliquer le design system
- **Taille :** ~850 lignes
- **Dernière mise à jour :** 13 février 2026 (noms d'icônes corrigés)

---

## 🛠️ Documentation Patterns & Conventions

### **docs/PATTERN_SAVE_BUTTON.md**
- **Contenu :** Pattern standard pour boutons de sauvegarde avec états (idle/saving/success/error)
- **Utiliser pour :** Implémenter des boutons de sauvegarde cohérents
- **Taille :** 441 lignes

### **.cursor/rules/project-core.mdc** ⭐
- **Contenu :** Règles de code principales, philosophie MVP-first, design tokens, conventions, nouveaux patterns (Error boundaries, Logger, DashboardPageShell, etc.)
- **Utiliser pour :** Conventions de code, règles automatiques Cursor AI
- **Type :** Always-applied workspace rule
- **Taille :** ~210 lignes
- **Dernière mise à jour :** 13 février 2026

### **.cursor/rules/save-button-pattern.mdc**
- **Contenu :** Règle Cursor pour pattern de bouton de sauvegarde
- **Utiliser pour :** Référence automatique pour l'IA lors de création de boutons

---

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

### Documents archivés (16 fichiers)

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

### Pourquoi archivés ?

✅ **Tâches complétées :** 13/17 tâches de l'audit terminées (76%)  
✅ **Code refactorisé :** Tous les changements sont appliqués dans le code  
✅ **Score qualité atteint :** 8.3/10 (objectif atteint)  
✅ **Documentation à jour :** Toute l'information pertinente est dans les docs actives

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
2. **`README.md`** → Quick start et vue d'ensemble
3. **`Project_context.md`** → Vision produit et architecture
4. **`docs/DESIGN_SYSTEM.md`** → Design system complet
5. **`docs/archive/REFACTORING_P1_P2_COMPLETE.md`** → Récap final refactoring (si besoin historique)

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

**Dernier scan :** 13 février 2026  
**Dernier nettoyage :** 13 février 2026

### Changements récents :

✅ **Archivé 12 documents** dans `docs/archive/` :
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
| Conventions de code | `.cursor/rules/project-core.mdc` |
| Pattern bouton sauvegarde | `docs/PATTERN_SAVE_BUTTON.md` |
| Déploiement | `DEPLOYMENT_NOTES.md`, `MISE_EN_PROD.md` |
| Historique refactoring | `docs/archive/REFACTORING_P1_P2_COMPLETE.md` |
| Historique audit | `docs/archive/AUDIT_COMPLET.md` |

---

**Pour toute question sur la documentation, consulter d'abord cet index.**
