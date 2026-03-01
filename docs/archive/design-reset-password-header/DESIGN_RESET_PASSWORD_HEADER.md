# Design – Page réinitialisation mot de passe : ancrage visuel

**Contexte :** La page `/[locale]/reset-password` est une page dédiée (depuis le lien email) sans en-tête de site, ce qui donne une impression de page « flottante » et peu reliée au reste de l’application.

**Objectif :** Proposer 2 solutions UI (mockups HTML) pour améliorer la perception de continuité (même site, même marque) sans changer le flux métier.

---

## Solution 1 – Même en-tête que la page d’accueil (validée)

**Idée :** Réutiliser **strictement le même en-tête** que la page d’accueil (`app/[locale]/page.tsx`) : barre sticky avec logo + « My Sport Ally » (lien vers `/`), LanguageSwitcher, séparateur vertical, AuthButtons (Se connecter + Créer un compte). Aucune différence visuelle ou structurelle avec le header de la home.

- **Composants à réutiliser tels quels :** Le **même** header que la home (même `<header>`, même structure interne), `Button`, `Input`, styles de carte existants (rounded-2xl, shadow-xl, border-palette-forest-dark).
- **Implémentation :** Partager le header entre la page d’accueil et les pages auth (reset-password, éventuellement login) via un layout commun ou un composant **PublicHeader** (logo `Image`, `LanguageSwitcher`, `AuthButtons`). Le formulaire reste dans la carte centrée comme aujourd’hui.

**Fichier mockup :** `reset-password-solution-1-header.html`

---

## Solution 2 – Contexte explicite + lien de retour

**Idée :** Garder la mise en page actuelle (fond dégradé, carte centrée) mais ajouter **au-dessus de la carte** une ligne de contexte : titre de l’étape (« Réinitialisation du mot de passe ») et un lien « Retour à l’accueil » ou « Se connecter ». Pas de barre de navigation complète, juste un ancrage textuel et une sortie claire.

- **Composants à réutiliser tels quels :** `Button`, `Input`, carte actuelle.
- **À faire évoluer :** Ajouter un petit bloc au-dessus de la carte (titre + lien) avec styles design system (text-sm, text-stone-600, lien en palette-forest-dark). Optionnel : petit logo ou nom « My Sport Ally » en texte pour renforcer la marque.

**Fichier mockup :** `reset-password-solution-2-context-link.html`

---

## Récapitulatif

| Critère              | Solution 1 (Même header que l’accueil) | Solution 2 (Contexte + lien) |
|----------------------|----------------------------------------|-------------------------------|
| Ancrage marque       | Fort (logo + nom, identique à la home) | Modéré (texte + lien)         |
| Cohérence avec home  | Identique (même composant / même structure) | Bonne                         |
| Effort implémentation| Layout partagé ou composant PublicHeader | Bloc léger au-dessus de la carte |
| Mobile               | Header compact comme sur la home       | Très léger                    |

Après validation du PO, découpage en user stories et critères d’acceptation avec référence aux zones des mockups.
