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
          'olive': '#8e9856',
          'sage': '#aaaa51',
          'gold': '#cbb44b',
          'amber': '#c9a544',
        },
      },
    },
  },
  plugins: [],
}

export default config
