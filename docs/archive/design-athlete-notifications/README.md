# Design — Notifications e-mail athlète (réponse coach)

**Statut :** solution A validée PO — Phase 2 Designer  
**Date :** 25 juin 2026

## Périmètre MVP

- E-mail à l'athlète quand un coach **accepte** ou **refuse** sa demande (préférence unique, activée par défaut).
- Page **Mes notifications** (`/dashboard/notifications`, athlète) — même route que le coach, contenu selon rôle.
- Préférence désactivable via toggle avec **sauvegarde immédiate** (auto-save).
- **Acceptation** : résumé court + CTA **Mon coach** (`/dashboard/coach`).
- **Refus** : résumé court (bloc coach / offre / date) → **texte d'accompagnement sous le bloc** (« D'autres coachs… ») → CTA **Trouver un coach** (`/dashboard/find-coach`).
- **En-tête e-mail** : logo MSA (`{{siteUrl}}/logo.png`, 56×56) dans le bandeau dégradé — identique e-mail coach.
- Langue = `preferred_locale` athlète ; destinataire = e-mail du compte.
- Échec Resend : log serveur uniquement ; la décision coach reste enregistrée.

## Décisions PO

| Sujet | Décision |
|-------|----------|
| Préférence | Unique (accept + refus) |
| CTA acceptation | `/dashboard/coach` |
| CTA refus | `/dashboard/find-coach` |
| Texte refus | Accompagnement pour encourager à trouver un autre coach |
| Nav athlète | **Mes notifications** sous **Mes informations** (menu compte + drawer) |

## User stories & mockups

| ID | Titre | Fichier HTML |
|----|-------|--------------|
| US-ATH-NOTIF-01 | Entrée navigation « Mes notifications » (athlète) | `MOCKUP_US_ATH_NOTIF_01_NAV_ENTRY.html` |
| US-ATH-NOTIF-02 | Page Mes notifications (toggle, états) | `MOCKUP_US_ATH_NOTIF_02_PAGE_STATES.html` |
| US-ATH-NOTIF-03 | E-mails acceptation / refus (charte auth MSA) | `MOCKUP_US_ATH_NOTIF_03_EMAIL.html` |

**Templates e-mail cibles implémentation :**

- `docs/email-templates/coaching-request-response-accepted-athlete.html`
- `docs/email-templates/coaching-request-response-declined-athlete.html`

(Même squelette que `coaching-request-coach.html` / templates auth.)

## Navigation athlète (bloc compte / drawer bas)

1. … (liens secondaires : Appareils, Mon coach, Historique)  
2. Contactez-nous  
3. **Mes informations**  
4. **Mes notifications** ← sous Mes informations  
5. Déconnexion  

## Hors scope MVP

- Push, SMS, notifications in-app.
- Toggles séparés acceptation / refus.
- Adresse e-mail distincte du compte.
- Historique des e-mails envoyés.
