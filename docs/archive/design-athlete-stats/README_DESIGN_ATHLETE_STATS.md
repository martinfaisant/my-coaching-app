# Maquettes — Page statistiques athlète (graphiques)



**Contexte :** page **entre Calendrier et Objectifs**, visible **avec ou sans coach** ; **années civiles** ; filtres globaux. Livraison des graphiques possible **par étapes**.

**Implémentation produit (mai 2026) :** **US-STATS-00** (page, nav, filtres) et **US-STATS-01** (courbe volume réalisé, 1 sport, N années) sont **livrés** — voir `Project_context.md` §4.2.3. Les US-STATS-02 à **06** restent sur maquettes uniquement.



**Règle produit — Volume réalisé (US-STATS-01) :** **un seul** graphique, en **courbes** ; **un sport à la fois** (sélecteur unique : changer de sport change les données affichées) ; **plusieurs années** peuvent être sélectionnées → **une ligne par année** (couleurs distinctes + légende). Les anciennes variantes « barres volume total » et « volume par sport en petits multiples » sont **abandonnées**.



**Dossier :** `docs/archive/design-athlete-stats/`



| US | Fichier HTML | Objet |

|----|----------------|-------|

| US-STATS-00 | `us-00-page-nav-filtres.html` | Route, nav, `DashboardPageShell`, bandeau filtres (années multi, granularité, **sport unique**, métrique), états vides |

| US-STATS-01 | `us-01-graph-volume-realise-courbe.html` | **Volume réalisé** : courbe(s), 1 sport, N années = N lignes |

| US-STATS-02 | `us-02-graph-plan-vs-realise.html` | Planifié vs réalisé |

| US-STATS-03 | `us-03-graph-ecart-pct-plan-reel.html` | Écart % plan → réalisé |

| US-STATS-04 | `us-04-graph-taux-seances-realisees.html` | Taux de séances réalisées |

| US-STATS-05 | `us-05-graph-timeline-objectifs.html` | Timeline des objectifs |

| US-STATS-06 | `us-06-graph-ressenti-intensite.html` | Ressenti / intensité / plaisir |



**Référence design system :** `docs/DESIGN_SYSTEM.md` (tokens palette, `Segments`, `TileCard`, `DashboardPageShell`, icônes sports).


