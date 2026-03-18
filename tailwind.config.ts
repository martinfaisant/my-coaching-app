import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'var(--font-sans)',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
        ],
        mono: [
          'var(--font-mono)',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          '"Liberation Mono"',
          '"Courier New"',
          'monospace',
        ],
      },
      colors: {
        'palette': {
          'forest-dark': '#627e59',
          'forest-darker': '#506648',
          'forest-light': '#f0f4ef',
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
      boxShadow: {
        'chat': '0 4px 24px -4px rgba(0,0,0,0.08), 0 8px 32px -8px rgba(0,0,0,0.06)',
        'chat-inner': '0 1px 2px rgba(0,0,0,0.04)',
        'palette-forest': '0 4px 6px -1px rgba(98,126,89,0.3)',
      },
    },
  },
  plugins: [],
}

export default config
