import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'palette': {
          'forest-dark': '#627e59',
          'forest-darker': '#506648',
          'olive': '#8e9856',
          'sage': '#aaaa51',
          'gold': '#cbb44b',
          'amber': '#c9a544',
          'strava': '#FC4C02',
          /** Danger : boutons Déconnexion, Supprimer, états d'erreur (Harmonie Nature) */
          'danger': '#c0564b',
          'danger-light': '#fdf2f1',
          'danger-dark': '#9e3b31',
          'danger-darker': '#7d3028',
        },
      },
    },
  },
  plugins: [],
}

export default config
