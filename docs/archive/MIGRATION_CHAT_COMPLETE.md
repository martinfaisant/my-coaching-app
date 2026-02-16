# Migration Composant Chat - Bilingue FR/EN ✅

**Date** : 15 février 2026  
**Statut** : ✅ Complété  
**Pattern** : next-intl (v3.x)

---

## 📋 Résumé

Migration complète du composant de chat (coach ↔ athlète) en bilingue français/anglais. Ce composant permet aux athlètes de discuter avec leur coach et aux coachs de gérer plusieurs conversations avec leurs athlètes.

**Note importante** : Le composant utilisait déjà `useLocale()` pour le formatage des dates. Cette migration a ajouté `useTranslations` et complété le namespace `chat` existant (3 → 10 clés).

---

## 📂 Fichiers migrés

| Fichier | Type | Lignes modifiées | Textes traduits |
|---------|------|------------------|-----------------|
| `messages/fr.json` | Traductions | +7 | Namespace complété |
| `messages/en.json` | Traductions | +7 | Namespace complété |
| `components/ChatModule.tsx` | Client Component | ~9 | Tous textes UI |
| `app/[locale]/actions/chat.ts` | Server Actions | 2 | Messages validation |

**Total** : 4 fichiers, 10 clés au total dans le namespace `chat`

---

## 🗂️ Namespace `chat` (complété)

### Clés existantes (3)

- `placeholder` : "Votre message..." / "Your message..."
- `send` : "Envoyer" / "Send"
- `noMessages` : "Aucun message" / "No messages"

### Nouvelles clés ajoutées (7)

**Section principale (6) :**
- ✨ `chatWithCoach` : "Chater avec mon coach" / "Chat with my coach"
- ✨ `chatWithAthletes` : "Discuter avec mes athlètes" / "Chat with my athletes"
- ✨ `conversationWith` : "Discussion avec {name}" / "Conversation with {name}"
- ✨ `loading` : "Chargement..." / "Loading..."
- ✨ `noCoachAssigned` : "Aucun coach assigné. Vous ne pouvez pas envoyer de message pour le moment." / "No coach assigned. You cannot send messages at the moment."
- ✨ `noConversations` : "Aucune discussion avec vos athlètes pour le moment." / "No conversations with your athletes at the moment."
- ✨ `you` : "Vous" / "You"

**Section validation (2) :**
- ✨ `validation.notConnected` : "Non connecté." / "Not connected."
- ✨ `validation.emptyMessage` : "Message vide." / "Empty message."

---

## 🔄 Modifications techniques

### Client Component

#### `components/ChatModule.tsx`

**État initial :** `useLocale()` déjà utilisé pour le formatage des dates ✅

**Changements :**

1. **Ajout import `useTranslations`** :
   ```typescript
   import { useLocale, useTranslations } from 'next-intl'
   ```

2. **ChatModule** (composant principal) :
   - Initialisation : `const t = useTranslations('chat')`
   - Remplacement du label du bouton flottant :
     - `'Chater avec mon coach'` → `t('chatWithCoach')`
     - `'Discuter avec mes athlètes'` → `t('chatWithAthletes')`

3. **ChatOverlay** (sous-composant modal) :
   - Initialisation : `const t = useTranslations('chat')`
   - Remplacement de 8 textes :
     - Titre dynamique : `'Discussion avec ${coachName}'` → `t('conversationWith', { name: coachName })`
     - Loading : `'Chargement...'` → `t('loading')`
     - Message pas de coach : `'Aucun coach assigné...'` → `t('noCoachAssigned')`
     - Message pas de conversations : `'Aucune discussion...'` → `t('noConversations')`
     - Placeholder input : `'Votre message...'` → `t('placeholder')`
     - Bouton envoyer : `'Envoyer'` → `t('send')`
     - Label "Vous" dans les messages : `' · Vous'` → `` · ${t('you')}``
   
4. **Passage de `locale` à `sendMessage`** :
   ```typescript
   const result = await sendMessage(currentConversationId, inputValue.trim(), locale)
   ```

### Server Actions

#### `app/[locale]/actions/chat.ts`

**Changements :**

1. **Import `getTranslations`** :
   ```typescript
   import { getTranslations } from 'next-intl/server'
   ```

2. **Fonction `sendMessage`** :
   - Ajout paramètre `locale: string = 'fr'`
   - Initialisation : `const t = await getTranslations({ locale, namespace: 'chat.validation' })`
   - Remplacement de 2 messages d'erreur :
     - `'Non connecté.'` → `t('notConnected')`
     - `'Message vide.'` → `t('emptyMessage')`

---

## ✅ Vérifications techniques

- [x] Aucune erreur de linter
- [x] Tous les imports `next-intl` présents
- [x] Locale passée aux server actions
- [x] Namespace `chat` cohérent entre fr.json et en.json
- [x] Clés de traduction identiques dans les 2 langues
- [x] Utilisation de `useTranslations` (client) et `getTranslations` (server)
- [x] Paramètre dynamique `{name}` supporté dans `conversationWith`
- [x] Formatage des dates préservé avec `localeTag` (fr-FR / en-US)

---

## 🧪 Tests à effectuer

### Vue Athlète (avec coach)

**En français** : Connexion en tant qu'athlète ayant un coach
- [ ] Bouton flottant affiché : "Chater avec mon coach" (avec icône)
- [ ] Clic → modal s'ouvre
- [ ] Titre : "Discussion avec [Nom du coach]"
- [ ] Messages affichés avec dates formatées en français
- [ ] Mes messages : bulles vertes avec " · Vous"
- [ ] Messages du coach : bulles grises
- [ ] Placeholder input : "Votre message..."
- [ ] Bouton "Envoyer" désactivé si champ vide
- [ ] Envoi d'un message → apparaît dans la liste
- [ ] Refresh automatique après envoi

**En anglais** : `/en/dashboard`
- [ ] Bouton : "Chat with my coach"
- [ ] Titre modal : "Conversation with [Coach name]"
- [ ] Mes messages : " · You"
- [ ] Placeholder : "Your message..."
- [ ] Bouton : "Send"
- [ ] Dates formatées en anglais

### Vue Athlète (sans coach)

- [ ] Bouton flottant n'apparaît pas (athlète sans coach)

### Vue Coach (avec athlètes)

**En français** : Connexion en tant que coach avec athlètes
- [ ] Bouton flottant : "Discuter avec mes athlètes"
- [ ] Clic → modal s'ouvre
- [ ] Titre : "Discuter avec mes athlètes"
- [ ] Onglets athlètes affichés (nom de chaque athlète)
- [ ] Sélection d'un athlète → messages affichés
- [ ] Mes messages : bulles vertes avec " · Vous"
- [ ] Messages de l'athlète : bulles grises
- [ ] Navigation entre athlètes fonctionne
- [ ] Envoi de message fonctionne

**En anglais** : `/en/dashboard`
- [ ] Bouton : "Chat with my athletes"
- [ ] Titre : "Chat with my athletes"
- [ ] " · You" dans mes messages

### Vue Coach (sans athlètes)

**En français** :
- [ ] Bouton flottant affiché
- [ ] Modal ouvre
- [ ] Message : "Aucune discussion avec vos athlètes pour le moment."
- [ ] Pas de formulaire d'envoi

**En anglais** :
- [ ] Message : "No conversations with your athletes at the moment."

### États de chargement

- [ ] Ouverture modal → "Chargement..." (FR) / "Loading..." (EN)
- [ ] Puis messages s'affichent

### Messages d'erreur

**Test avec utilisateur non connecté** (simuler déconnexion) :
- [ ] FR : "Non connecté."
- [ ] EN : "Not connected."

**Test envoi message vide** :
- [ ] FR : "Message vide."
- [ ] EN : "Empty message."

### Formatage des dates

- [ ] Messages du jour : heure uniquement (14:30)
- [ ] Messages anciens : date + heure (15 fév., 14:30)
- [ ] Format FR : "15 fév., 14:30"
- [ ] Format EN : "Feb 15, 2:30 PM"

---

## 📊 Complexité

**Niveau** : 6/10 (composant interactif avec états multiples)

**Raisons :**
- Composant client avec 2 sous-composants (ChatModule + ChatOverlay)
- Gestion de 2 vues différentes (athlète/coach)
- États multiples : loading, sending, conversations, messages
- Navigation entre conversations pour les coachs
- Formatage dynamique des dates selon la locale
- Modal avec footer personnalisé
- Déjà partiellement préparé (`useLocale()` existant)

---

## 🎨 Caractéristiques UX

### Bouton flottant
- Position : `bottom-6 right-6` fixe
- Style : bouton primaire rond avec ombre
- Icône : bulle de chat
- Responsive : texte caché sur mobile (`hidden sm:inline`)

### Modal
- Alignement : droite de l'écran
- Taille : `md` (moyenne)
- Hauteur : `80vh` max `600px`
- Bordure : `border-2 border-palette-forest-dark`

### Messages
- Bulles arrondies avec bordure
- Mes messages : fond vert foncé (`palette-forest-dark`), texte blanc
- Messages reçus : fond gris clair (`stone-100`), texte noir
- Timestamp + label "Vous" en petit
- Scroll automatique vers le bas

### Formulaire
- Input avec bordure verte épaisse
- Bouton "Envoyer" désactivé si vide
- États de chargement (sending)
- Messages d'erreur affichés au-dessus

---

## 📚 Références

- Pattern de migration : `MIGRATION_OFFRES_COMPLETE.md`, `MIGRATION_MES_ATHLETES_COMPLETE.md`, `MIGRATION_MON_COACH_COMPLETE.md`, `MIGRATION_APPAREILS_CONNECTES_COMPLETE.md`
- Documentation i18n : `I18N_IMPLEMENTATION.md`
- Namespace `chat` complété (3 → 10 clés)
- Formatage des dates avec `Intl.DateTimeFormat` (via `toLocaleTimeString` / `toLocaleDateString`)

---

## 🔍 Notes techniques

### Architecture des conversations

**Athlète :**
- Une seule conversation : athlète ↔ son coach
- Créée automatiquement au premier accès (`getOrCreateConversationForAthlete`)
- Pas de navigation, conversation toujours visible

**Coach :**
- Multiples conversations : coach ↔ chaque athlète
- Liste récupérée au chargement (`getConversationsForCoach`)
- Navigation par onglets (boutons avec nom de l'athlète)
- Tri par `updated_at` DESC (conversations récentes en premier)

### Gestion des messages

- Messages récupérés par `getMessages(conversationId)`
- Tri par `created_at` ASC (ordre chronologique)
- Refresh après envoi pour afficher le nouveau message
- Pas de temps réel (WebSockets) : refresh manuel seulement

### Formatage des dates

Utilise `formatMessageTime(iso, localeTag)` :
- `localeTag` : `'fr-FR'` ou `'en-US'` selon la locale
- Même jour : heure uniquement (`toLocaleTimeString`)
- Jour différent : date + heure (`toLocaleDateString`)

---

## 🎯 Prochaines étapes

Autres pages à migrer (ordre de priorité) :

1. **Calendrier** (`app/[locale]/dashboard/calendar/page.tsx`)
   - ~40 textes (jours, mois, boutons, navigation)
   - Composants `CalendarView`, `CalendarViewWithNavigation` partagés
   - Page complexe avec gestion de semaines

2. **Profil** (`app/[locale]/dashboard/profile/page.tsx`)
   - ~30 textes (formulaire, labels, validations)
   - Pattern similaire à Mon coach
   - Formulaire "Mes informations"

3. **Objectifs** (`app/[locale]/dashboard/objectifs/page.tsx`)
   - ~25 textes (formulaire, liste, badges)
   - Gestion de courses/compétitions

4. **Détail athlète** (`app/[locale]/dashboard/athletes/[athleteId]/page.tsx`)
   - Peu de textes (délègue à `CoachAthleteCalendarPage`)

---

## 💬 Améliorations futures (hors scope)

- [ ] Temps réel avec WebSockets/Supabase Realtime
- [ ] Notifications de nouveaux messages
- [ ] Indicateur "en train d'écrire..."
- [ ] Marquage des messages comme lus
- [ ] Support des emojis/GIFs
- [ ] Upload de fichiers/images
- [ ] Recherche dans l'historique
- [ ] Archivage de conversations

---

**✅ Migration Composant Chat complétée avec succès !**
