# Design — Abonnement plateforme coach (Stripe)

**Statut :** Phase Designer — solution **B** validée par le PO.  
**Périmètre UI :** pas de page dédiée dans l’app ; paiement et offres gérés côté **Stripe** (Checkout / Customer Portal selon spec Architecte).

## User stories → mockups

| US | Fichier | Rôle |
|----|---------|------|
| US-COACH-PLAT-01 | `MOCKUP_US1_MES_ATHLETES_ABONNEMENT_INACTIF.html` | Liste athlètes bloquée + demandes (Refuser OK, Discuter bloqué, CTA Stripe) |
| US-COACH-PLAT-02 | `MOCKUP_US2_MODAL_ABONNEMENT_STRIPE.html` | Modal avant redirection Stripe au clic **Accepter** |
| US-COACH-PLAT-03 | `MOCKUP_US3_CALENDRIER_COACH_BLOQUE.html` | Page `/dashboard/athletes/[id]` sans données utiles — carte blocage |
| US-COACH-PLAT-04 | `MOCKUP_US4_RETOUR_STRIPE_BANDEAUX.html` | Bandeaux retour succès / annulé / erreur sur Mes athlètes |

## Contraintes produit (rappel PO)

- Sans abonnement actif : **aucune consultation** des infos athlètes (liste + calendrier / onglets).
- **Chat** : réservé à un coach avec abonnement actif.
- **Refuser** une demande : autorisé sans abonnement.
- **Accepter** : passage par Stripe si non abonné (modal option B).
- **Tarifs / produits** : configurés dans le **dashboard Stripe** (pas d’UI catalogue dans l’app pour l’instant).

## Suite du pipeline

→ **Mode Architecte** (webhooks, modèle de données `coach_platform_subscription` ou équivalent, URLs de retour, garde-fous RLS / server actions).
