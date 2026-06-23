# Maquettes — Modernisation graphiques stats (#119)

**Archivé le 23 juin 2026** — feature livrée en produit.

**Issue :** [#119](https://github.com/martinfaisant/my-coaching-app/issues/119) — Option A validée (courbe lissée, ligne conservée).  
**Doublon #118 :** fermé.

**Décisions PO :**
- Granularité mois = **courbe** (pas de barres).
- Jauges circulaires = **hors périmètre** (#120).
- **Solution validée (hybride) :** courbe **A1** + encart volumes annuels **A2**.

| Élément | Variante | Fichier de référence |
|---------|----------|----------------------|
| **Courbe** | A1 | `MOCKUP_STATS_CHART_A1_GRADIENT_RECENT.html` |
| **Encart volume annuel** | A2 | `MOCKUP_STATS_CHART_A2_NO_GRADIENT.html` (section encart) |
| **Combiné validé** | A1 + A2 | **`MOCKUP_STATS_CHART_VALIDATED_A1_A2.html`** |

Explorations non retenues : `MOCKUP_STATS_CHART_A3_GRADIENT_ALL.html`.

**Référence implémentation :** `components/athlete/AthleteStatsVolumeChart.tsx`, `components/athlete/AthleteStatsAnnualSummary.tsx`, `lib/athleteStatsChartUi.ts`, `lib/athleteStatsNivoLayers.tsx`, `docs/DESIGN_SYSTEM.md` § AthleteStatsVolumeChart / AthleteStatsAnnualSummary. Comportement produit : **Project_context.md** §4.2.3.
