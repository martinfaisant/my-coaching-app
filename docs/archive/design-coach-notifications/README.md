# Design — Notifications e-mail coach

**Statut :** solution validée PO (proposition B, auto-save) — Phase 2 Designer  
**Date :** 25 juin 2026

## Périmètre MVP

- E-mail au coach à chaque **nouvelle demande de coaching** (activé par défaut).
- Page **Mes notifications** (`/dashboard/notifications`, coach uniquement).
- Préférence désactivable via toggle avec **sauvegarde immédiate**.
- E-mail : résumé court + CTA vers Mes athlètes ; langue = `preferred_locale` coach ; destinataire = e-mail du compte.
- Échec Resend : log serveur uniquement ; la demande reste enregistrée.

## User stories & mockups

| ID | Titre | Fichier HTML |
|----|-------|--------------|
| US-NOTIF-01 | Entrée navigation « Mes notifications » | `MOCKUP_US_NOTIF_01_NAV_ENTRY.html` |
| US-NOTIF-02 | Page Mes notifications (toggle à droite de la ligne) | `MOCKUP_US_NOTIF_02_PAGE_STATES.html` |
| US-NOTIF-03 | E-mail nouvelle demande (charte auth MSA) | `MOCKUP_US_NOTIF_03_EMAIL.html` |

**Template e-mail implémentation :** `docs/email-templates/coaching-request-coach.html` (même squelette que `reset-password.html` / `confirm-signup.html`).

## Navigation coach (ordre menu compte)

1. Mes informations  
2. **Mes notifications**  
3. Mon Abonnement MySportAlly  
4. Contactez-nous  

## Hors scope MVP

- Notifications athlète, push, SMS.
- Adresse e-mail de notification distincte du compte.
- Historique des e-mails envoyés.
