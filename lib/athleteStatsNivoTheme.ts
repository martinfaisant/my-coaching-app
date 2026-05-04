/**
 * Thème partiel Nivo pour la page stats athlète.
 * Couleurs via variables CSS (`globals.css` : `--chart-*`) pour rester aligné sur les neutres du dashboard.
 */
export const ATHLETE_STATS_NIVO_THEME = {
  background: 'transparent',
  grid: { line: { stroke: 'var(--chart-grid-line)' } },
  axis: {
    domain: { line: { stroke: 'var(--chart-axis-domain)' } },
    ticks: { text: { fill: 'var(--chart-axis-tick)', fontSize: 11 } },
  },
  legends: { text: { fill: 'var(--chart-legend-text)', fontSize: 12 } },
  tooltip: { container: { background: 'var(--chart-tooltip-bg)', fontSize: 12 } },
} as const
