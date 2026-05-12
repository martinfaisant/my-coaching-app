import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir),
    },
  },
  test: {
    // Évite les timeouts « Failed to start forks worker » sur Windows / machines lentes (Vitest 4 pool forks).
    pool: 'threads',
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/e2e/**'],
    clearMocks: true,
  },
})
