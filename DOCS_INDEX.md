# 📚 Index de la Documentation

**Dernière mise à jour :** 13 février 2026

> ⚠️ **Avant de créer un nouveau document, TOUJOURS vérifier cet index pour éviter les doublons !**

---

## 🎯 Documentation Active (à utiliser en priorité)

### **Project_context.md** ⭐
- **Contenu :** Vision produit, philosophie, rôles (Athlete/Coach/Admin), features actuelles, data model, stack technique
- **Utiliser pour :** Comprendre le projet, les features, les rôles, l'architecture globale
- **Taille :** 363 lignes

### **docs/DESIGN_SYSTEM.md** ⭐
- **Contenu :** Tokens (couleurs, typo, espacements), composants (Button, Input, Badge, etc.), guidelines UI, exemples de code
- **Utiliser pour :** Créer ou modifier des composants UI, choisir des couleurs, appliquer le design system
- **Taille :** 828 lignes

### **README.md** ⭐
- **Contenu :** Setup projet, commandes de démarrage, configuration Strava, déploiement
- **Utiliser pour :** Démarrer le projet, configurer l'environnement
- **Taille :** ~50 lignes

---

## 🚀 Documentation Opérationnelle

### **DEPLOYMENT_NOTES.md**
- **Contenu :** Notes et procédures de déploiement
- **Utiliser pour :** Déployer l'application, résoudre des problèmes de déploiement

### **MISE_EN_PROD.md**
- **Contenu :** Checklist et étapes pour mise en production
- **Utiliser pour :** Préparer une release production

---

## 📋 Documentation Historique (READ-ONLY - Ne pas modifier)

> Ces documents sont des archives de décisions passées, audits, et états des lieux.  
> Ils servent de référence historique mais ne doivent **PAS être édités**.

### États des lieux
- **MODALES_ETAT_DES_LIEUX_FINAL.md** - État des lieux modales final (5 février 2026)

### Audits & Plans
- **AUDIT_COMPLET.md** - Audit complet du projet
- **PLAN_AMELIORATION.md** - Plan d'amélioration général

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
| Documentation technique longue | `/docs/nom-descriptif.md` | `docs/API_DOCUMENTATION.md` |
| Référence rapide projet | `racine/NOM_MAJUSCULE.md` | `CONVENTIONS.md` |
| État des lieux / Audit | `racine/NOM_DESCRIPTIF.md` | `AUDIT_COMPLET.md` |
| Fix spécifique | `/docs/FIX_description.md` | `docs/FIX_AUTH_FLOW.md` |

### Hiérarchie des sources (ordre de priorité)

1. **`.cursorrules`** → Chargé automatiquement, règles globales
2. **`.cursor/rules/project-core.mdc`** → Conventions et philosophie (alwaysApply)
3. **`Project_context.md`** → Vision produit et architecture
4. **`docs/DESIGN_SYSTEM.md`** → Design system complet
5. **`README.md`** → Setup et démarrage

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

**Responsable :** Maintenir à jour manuellement ou via script de scan

**Dernier scan :** 13 février 2026  
**Dernier nettoyage :** 13 février 2026
- Suppression de 2 doublons : MODALES_ETAT_DES_LIEUX v1 et v2
- Suppression de 3 audits design system (contenu intégré dans DESIGN_SYSTEM.md)
- Suppression de 2 fixes historiques (corrections appliquées)
