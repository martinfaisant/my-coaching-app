# Design — Template email HTML (auth + marketing)

**Mode :** Designer  
**Date :** 26 février 2026

---

## 1. Besoin reformulé

- **Objectif :** Un template d’email HTML moderne, avec une **belle en-tête** et un **beau pied de page**, réutilisable pour :
  - **Court terme :** confirmation d’email (création de compte), mot de passe oublié.
  - **Suite :** autres emails marketing (newsletter, relances, etc.).
- **Contraintes :** 
  - Alignement avec le design system (couleurs palette nature/sport, typo lisible).
  - Images libres de droits à connotation sportive (ex. activités en fil de fer / wireframe) possibles.
  - Compatible clients email (inline styles, tables, pas de JS).

---

## 2. Cas couverts

| Cas | Détail |
|-----|--------|
| **Nominal** | Ouverture sur desktop et mobile, lecture claire du titre, du corps et du CTA. |
| **Confirmation d’inscription** | Titre + texte + bouton « Confirmer mon email » (lien `{{ .ConfirmationURL }}`). |
| **Mot de passe oublié** | Même structure, titre/texte/bouton « Réinitialiser le mot de passe » (lien reset). |
| **Marketing futur** | Zone centrale éditable ; en-tête et pied de page identiques. |
| **Limites** | Certains clients bloquent les images externes → le message reste lisible grâce au texte et au CTA ; logo depuis `{{ .SiteURL }}` recommandé. |

---

## 3. Trois propositions (mockups HTML)

Les mockups sont **non fonctionnels** (variables Supabase en `{{ }}` à garder telles quelles dans le vrai template).

| Fichier | Concept | En-tête | Pied de page |
|---------|--------|--------|--------------|
| **A** | `mockup-email-template-a-hero.html` | Bandeau **image** sport (hero) + barre logo + nom | Texte marque + copyright |
| **B** | `mockup-email-template-b-minimal.html` | **Sans image** : bandeau dégradé (forest → olive) + logo + nom centrés | Une ligne : copyright + lien site |
| **C** | `mockup-email-template-c-marketing.html` | Barre logo + nom, puis **bandeau illustration** sport | Footer **riche** (fond sombre) : liens Accueil / Connexion / Contact + mention « pourquoi cet email » + copyright |

---

## 4. Composants / éléments utilisés

- **Design system :**  
  - Couleurs : `#506648` (forest-darker), `#627e59` (forest-dark), `#8e9856` (olive), `#cbb44b` (gold accents footer C), stone (`#fafaf9`, `#1c1917`, `#57534e`, `#78716c`, `#e7e5e4`).  
  - Typo : titres 22px/600, corps 15px, secondaire 13px/12px.  
  - Bouton CTA : fond `#506648`, blanc, border-radius 8px, padding 14px 28px.
- **À utiliser tels quels (déjà en place) :**  
  - Logo `{{ .SiteURL }}/logo.png` (**PNG obligatoire** en email : les SVG sont souvent bloqués par Outlook et d’autres clients), nom « My Sport Ally », structure table + cellules pour compatibilité email.
- **À faire évoluer / choisir :**  
  - **Option A :** Remplacer l’URL de l’image hero par une image hébergée sur votre domaine (ou CDN) pour fiabilité et blocage d’images.  
  - **Option C :** Remplacer l’illustration par une image « fil de fer » / line-art sport si souhaité ; garder la zone même sans image (fond `#f0f4ef`).  
  - Pied de page C : liens (Accueil, Connexion, Contact) à ajuster selon les routes réelles.

---

## 5. Images libres de droits (sport)

- **Unsplash** (gratuit, licence permissive) :  
  [https://unsplash.com/s/photos/sport](https://unsplash.com/s/photos/sport),  
  [https://unsplash.com/s/photos/running](https://unsplash.com/s/photos/running),  
  [https://unsplash.com/s/photos/cycling](https://unsplash.com/s/photos/cycling).  
  Exemple utilisé dans les mockups : `photo-1571019614242-c5c5dee9f50b` (fitness), `photo-1517836357463-d25dfeac3438` (running).  
  **Recommandation :** télécharger l’image choisie et l’héberger sur votre site (ex. `/images/email/hero.jpg`) pour éviter le blocage par les clients email.
- **Pexels** : [https://www.pexels.com/search/sport/](https://www.pexels.com/search/sport/) — idem, hébergement propre conseillé.
- **Style « fil de fer » / wireframe / line-art :**  
  - Undraw (illustrations SVG) : [https://undraw.co](https://undraw.co) — exporter en PNG pour l’email.  
  - Flaticon / Freepik (filtrer « free ») pour des icônes ou illustrations sport.  
  - Si vous avez une illustration custom (ex. coureur en fil de fer), l’héberger en PNG sur votre domaine et l’utiliser dans la zone prévue (option A ou C).

---

## 6. Checklist avant livraison Designer

- [x] Design system consulté (couleurs, typo, CTA).
- [x] Mockups validables visuellement (ouvrir les 3 HTML dans un navigateur).
- [x] Chaque option décrite (en-tête, pied de page).
- [x] Éléments design system à utiliser / à faire évoluer indiqués.
- [x] Sources d’images libres citées.

---

**Suite :** Après validation du PO sur une option (ou combinaison), découpage en user stories avec critères d’acceptation et référence au mockup choisi.
